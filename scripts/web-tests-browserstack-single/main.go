package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"path"
	"strings"
	"time"

	"github.com/hashicorp/go-version"
	ua "github.com/mileusna/useragent"
	"github.com/mrhenry/web-tests/scripts/browserstack"
	"github.com/mrhenry/web-tests/scripts/feature"
	"github.com/mrhenry/web-tests/scripts/result"
	"github.com/mrhenry/web-tests/scripts/store"
	"github.com/tebeka/selenium"
	"golang.org/x/sync/semaphore"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute*120)
	defer cancel()

	db, err := store.NewSqliteDatabase("./web-tests.db", false)
	if err != nil {
		panic(err)
	}

	defer store.CloseDB(db)

	run(ctx, db)
}

func run(parentCtx context.Context, db *sql.DB) {
	ctx, cancel := context.WithTimeout(parentCtx, time.Minute*30)
	defer cancel()

	sessionName := fmt.Sprintf("Web Tests (%d) – %s", 1, time.Now().Format(time.RFC3339))
	userName := os.Getenv("BROWSERSTACK_USERNAME")
	accessKey := os.Getenv("BROWSERSTACK_ACCESS_KEY")

	mapping, err := getMapping(ctx, db)
	if err != nil {
		log.Println(err)
		return
	}

	client := browserstack.New(browserstack.Config{
		UserName:  userName,
		AccessKey: accessKey,
	})

	done, err := client.OpenTunnel(ctx)
	defer done()
	if err != nil {
		log.Println(err)
		return
	}

	log.Println("tunnel ready")

	err = runTest(
		ctx,
		db,
		client,
		browserstack.Browser{
			Browser:        "chrome",
			BrowserVersion: "80",
		},
		[]browserstack.Test{
			{
				Path: path.Join(
					"./tests",
					fmt.Sprintf(
						"%s:%s.html",
						"f209d29e-a7d7-47ec-b7b4-81b615e55976",
						"pure",
					),
				),
			},
		},
		sessionName,
		mapping,
	)
	if err != nil {
		log.Println(err)
	}
}

func runTest(parentCtx context.Context, db *sql.DB, client *browserstack.Client, browser browserstack.Browser, tests []browserstack.Test, sessionName string, mapping feature.Mapping) error {
	ctx, cancel := context.WithTimeout(parentCtx, time.Minute*10)
	defer cancel()

	caps := client.SetCaps(selenium.Capabilities{
		"browserstack.local":       "true",
		"browserstack.video":       "false",
		"browserstack.debug":       "true",
		"browserstack.console":     "verbose",
		"browserstack.networkLogs": "true",
		"build":                    sessionName,
		"name":                     fmt.Sprintf("%s – %s", "Web Tests", browser.ResultKey()),
	})

	browserVersion, _ := reallyTolerantSemver(browser.BrowserVersion)
	osVersion, _ := reallyTolerantSemver(browser.OSVersion)

	if browser.Device != "" {
		caps["deviceName"] = browser.Device
	}
	if browser.OS != "" {
		caps["platformName"] = browser.OS
	}
	if browser.OSVersion != "" {
		caps["platformVersion"] = browser.OSVersion
	}
	if browser.Browser != "" {
		caps["browserName"] = browser.Browser
	}
	if browser.BrowserVersion != "" {
		caps["browserVersion"] = browser.BrowserVersion
	}

	w3cCompatible := false
	if browser.Browser == "firefox" {
		if browserVersion != nil && browserVersion.Segments()[0] > 55 {
			w3cCompatible = true
		}
	} else if browser.Browser == "chrome" {
		if browserVersion != nil && browserVersion.Segments()[0] > 80 {
			w3cCompatible = true
		}
	} else if browser.OS == "ios" {
		if osVersion != nil && osVersion.Segments()[0] > 11 {
			w3cCompatible = true
		}
	} else if browser.Browser == "safari" {
		if browserVersion != nil && browserVersion.Segments()[0] > 11 {
			w3cCompatible = true
		}
	}

	in := make(chan browserstack.Test, len(tests))
	out := make(chan browserstack.Test, len(tests))

	testResults := []browserstack.Test{}

	go func() {
		for _, test := range tests {
			select {
			case <-ctx.Done():
				if ctx.Err() == context.DeadlineExceeded {
					log.Println("test run deadline exceeded while sending tests to the runner")
				}
				close(in)
				return
			default:
			}

			in <- test
		}

		close(in)
	}()

	go func() {
		for {
			select {
			case <-ctx.Done():
				if ctx.Err() == context.DeadlineExceeded {
					log.Println("test run deadline exceeded while waiting for Selemium results in main")
				}
				return
			case test, ok := <-out:
				if !ok {
					return
				}

				testResults = append(testResults, test)
				if !test.DidRun() {
					log.Println(browser.ResultKey(), test.Path, test.DidRun(), test.Success(), test.Duration())
					log.Println(test.UserAgent)
				}
			}
		}
	}()

	err := client.RunTest(ctx, caps, w3cCompatible, in, out)
	if err != nil {
		return err
	}

	for _, testResult := range testResults {
		err = writeResults(ctx, db, browser, testResult, mapping)
		if err != nil {
			return err
		}
	}

	return nil
}

var writeSema = semaphore.NewWeighted(1)

func writeResults(ctx context.Context, db *sql.DB, browser browserstack.Browser, test browserstack.Test, mapping feature.Mapping) error {
	if err := writeSema.Acquire(ctx, 1); err != nil {
		return err
	}

	defer writeSema.Release(1)

	featureName := ""

	r := result.Result{
		OS:        browser.OS,
		OSVersion: browser.OSVersion,
	}

	if test.DidRun() == false {
		return nil
	}
	if item, ok := mapping[test.MappingID()]; ok {
		r.FeatureID = item.ID
		r.Test = test.MappingTestName()
		featureName = fmt.Sprintf("%s %s %s %s", item.Spec.Org, item.Spec.ID, item.Spec.Section, item.Spec.Name)
	} else {
		return fmt.Errorf("not found in mapping %s", test.MappingID())
	}

	ua := ua.Parse(test.UserAgent)
	version, err := reallyTolerantSemver(ua.Version)
	if err != nil {
		log.Println("version", ua.Version)
		log.Println("browser version", browser.BrowserVersion)
		log.Println("os version", browser.OSVersion)
		log.Println(err)

		if browser.OSVersion != "" {
			version, err = reallyTolerantSemver(browser.OSVersion)
		} else {
			version, err = reallyTolerantSemver(browser.BrowserVersion)
		}
	}
	if err != nil {
		panic(err)
	}

	browserName := strings.ToLower(browser.Browser)
	browserVersion := browser.BrowserVersion
	if strings.ToLower(browser.OS) == "ios" {
		browserName = "safari"
		browserVersion = fmt.Sprintf("%d.%d", version.Segments()[0], version.Segments()[1])
	} else if browserName == "safari" {
		browserName = "safari"
		browserVersion = fmt.Sprintf("%d.%d", version.Segments()[0], version.Segments()[1])
	}

	r.Browser = browserName
	r.BrowserVersion = browserVersion

	newResult := false
	r, err = store.SelectResult(ctx, db, r)
	if err == sql.ErrNoRows {
		newResult = true
		err = nil
	}
	if err != nil {
		return err
	}
	if r.Score == -1 {
		newResult = true
		r.Score = 0
	}

	oldScore := r.Score

	var newScore float64 = 0
	if test.Success() {
		newScore = 1
	}

	if newResult {
		r.Score = newScore
	}

	if r.Score > 0.2 && test.Success() {
		// Test is succeeding and seems to be going up.
		r.Score = r.Score + 0.1
	} else if r.Score > 0.1 && test.Success() {
		// Test appears to be succeeding and might to be going up.
		r.Score = r.Score + 0.05
	} else if r.Score < 0.8 && !test.Success() {
		// Test is failing and seems to be going down.
		r.Score = r.Score - 0.02
	} else if r.Score < 0.9 && !test.Success() {
		// Test appears to be failing and might to be going down.
		r.Score = r.Score - 0.02
	} else {
		// Test might go either way.
		r.Score = (r.Score - 0.01) + (newScore * 0.02)
	}

	if r.Score > 1 {
		r.Score = 1
	}

	if r.Score < 0.00099 {
		r.Score = 0
	}

	if oldScore != r.Score {
		if oldScore > r.Score {
			log.Printf("\033[31m%s - %s - %s - delta : %.3f - current : %.3f\033[0m", featureName, browser.ResultKey(), r.Test, r.Score-oldScore, r.Score)
		} else {
			log.Printf("%s - %s - %s - delta : %.3f - current : %.3f", featureName, browser.ResultKey(), r.Test, r.Score-oldScore, r.Score)
		}
	}

	err = store.UpsertResult(ctx, db, r)
	if err != nil {
		return err
	}

	return nil
}

func getMapping(ctx context.Context, db *sql.DB) (feature.Mapping, error) {
	allFeatures, err := store.SelectAllFeatures(ctx, db)
	if err != nil {
		return nil, err
	}

	out := feature.Mapping{}
	for _, feature := range allFeatures {
		out[feature.ID] = feature
	}

	return out, nil
}

func reallyTolerantSemver(v string) (*version.Version, error) {
	switch strings.Count(v, ".") {
	case 2:
		return version.NewVersion(v)
	case 1:
		return version.NewVersion(v + ".0")
	case 0:
		return version.NewVersion(v + ".0.0")
	default:
		return version.NewVersion(v)
	}
}
