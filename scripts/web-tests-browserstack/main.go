package main

import (
	"bytes"
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"math/rand"
	"os"
	"os/signal"
	"path/filepath"
	"sort"
	"strings"
	"syscall"
	"time"

	"github.com/mrhenry/web-tests/scripts/feature"
	"github.com/mrhenry/web-tests/scripts/web-tests-browserstack/api"
	"github.com/tebeka/selenium"
	"golang.org/x/sync/semaphore"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute*60)
	defer cancel()

	runnerCtx, runnerCancel := context.WithCancel(ctx)
	defer runnerCancel()

	sigs := make(chan os.Signal, 1)
	doneChan := make(chan bool, 1)

	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sigs
		runnerCancel()

		time.Sleep(time.Second * 30)

		cancel()

		time.Sleep(time.Second * 5)

		doneChan <- true

		time.Sleep(time.Second * 30)

		os.Exit(0)
	}()

	var browserArg string
	var testFilterArg string

	flag.StringVar(&browserArg, "browser", "", "Only run on browser")
	flag.StringVar(&testFilterArg, "run", "", "Only run tests matching")

	flag.Parse()

	sessionName := fmt.Sprintf("Web Tests – %s", time.Now().Format(time.RFC3339))
	userName := os.Getenv("BROWSERSTACK_USERNAME")
	accessKey := os.Getenv("BROWSERSTACK_ACCESS_KEY")

	mapping, err := getMapping()
	if err != nil {
		log.Fatal(err)
	}

	client := api.New(api.Config{
		UserName:  userName,
		AccessKey: accessKey,
	})

	done, err := client.OpenTunnel(ctx)
	defer done()
	if err != nil {
		log.Fatal(err)
	}

	log.Println("tunnel ready")

	browsers, err := client.ReducedBrowsers(ctx)
	if err != nil {
		log.Fatal(err)
	}

	if browserArg != "" {
		filteredBrowsers := []api.Browser{}
		for _, b := range browsers {
			if strings.Contains(b.ResultKey(), browserArg) {
				filteredBrowsers = append(filteredBrowsers, b)
			}
		}

		if len(filteredBrowsers) > 0 {
			browsers = filteredBrowsers
		}
	}

	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(browsers), func(i, j int) {
		browsers[i], browsers[j] = browsers[j], browsers[i]
	})

	browsersLimit := 50
	if len(browsers) > browsersLimit {
		browsers = browsers[:browsersLimit]
	}

	// Device runs take longer, doing these earlier gives a faster overal run
	sort.SliceStable(browsers, func(i int, j int) bool {
		if browsers[i].Device != "" && browsers[j].Device == "" {
			return true
		}

		return false
	})

	sema := semaphore.NewWeighted(5)

	for _, b := range browsers {
		if err := sema.Acquire(ctx, 1); err != nil {
			log.Fatal(err)
		}

		go func(b api.Browser) {
			defer sema.Release(1)

			select {
			case <-runnerCtx.Done():
				return
			default:
			}

			err = runTest(runnerCtx, client, b, sessionName, mapping, testFilterArg)
			if err != nil {
				log.Println(err) // non-fatal for us
			}
		}(b)
	}

	go func() {
		// Wait for all
		if err := sema.Acquire(ctx, 5); err != nil {
			log.Fatal(err)
		}

		err = done()
		if err != nil {
			log.Println(err) // non-fatal for us
		}

		doneChan <- true
	}()

	<-doneChan
}

func runTest(parentCtx context.Context, client *api.Client, browser api.Browser, sessionName string, mapping map[string]map[string]map[string]feature.FeatureWithDir, testFilter string) error {
	ctx, cancel := context.WithTimeout(parentCtx, time.Minute*10)
	defer cancel()

	caps := client.SetCaps(selenium.Capabilities{
		"browserstack.local": "true",
		"browserstack.video": "false",
		// "browserstack.debug":           "true",
		// "browserstack.console":         "errors",
		// "browserstack.networkLogs":     "errors",
		"build": sessionName,
		"name":  fmt.Sprintf("%s – %s", "Web Tests", browser.ResultKey()),
	})

	if browser.Device != "" {
		caps["deviceName"] = browser.Device
		// caps["browserstack.appium_version"] = "1.8.0"
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

	tests := []api.Test{}
	testPaths, err := getTestPaths()
	if err != nil {
		return err
	}

	for _, p := range testPaths {
		if testFilter == "" {
			tests = append(tests, api.Test{
				Path: p,
			})
		} else if strings.Contains(p, testFilter) {
			tests = append(tests, api.Test{
				Path: p,
			})
		}
	}

	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(tests), func(i, j int) {
		tests[i], tests[j] = tests[j], tests[i]
	})

	if len(tests) > 250 {
		tests = tests[:250]
	}

	in := make(chan api.Test, len(tests))
	out := make(chan api.Test, len(tests))

	testResults := []api.Test{}

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
				// log.Println(browser.ResultKey(), test.Path, test.Success(), test.Duration())
			}
		}
	}()

	err = client.RunTest(ctx, caps, in, out)
	if err != nil {
		return err
	}

	for _, testResult := range testResults {
		err = writeResults(browser, testResult, mapping)
		if err != nil {
			return err
		}
	}

	return nil
}

func getTestPaths() ([]string, error) {
	var files []string

	err := filepath.Walk("./tests/", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !strings.HasSuffix(path, ".html") {
			return nil
		}

		files = append(files, path)
		return nil
	})
	if err != nil {
		return nil, err
	}

	return files, nil
}

func writeResults(browser api.Browser, test api.Test, mapping map[string]map[string]map[string]feature.FeatureWithDir) error {
	resultsDir := ""
	if item, ok := mapping[test.MappingOrg()][test.MappingID()][test.MappingSection()]; ok {
		resultsDir = filepath.Join(item.Dir, "results", test.MappingTestName())
		err := os.MkdirAll(resultsDir, os.ModePerm)
		if err != nil {
			return err
		}
	} else {
		return fmt.Errorf("not found in mapping %s %s %s", test.MappingOrg(), test.MappingID(), test.MappingSection())
	}

	resultsPath := filepath.Join(resultsDir, fmt.Sprintf("%s.json", browser.ResultFilename()))

	results := map[string]interface{}{
		"os":              browser.OS,
		"os_version":      browser.OSVersion,
		"browser":         browser.Browser,
		"browser_version": browser.BrowserVersion,
	}

	{
		f1, err := os.Open(resultsPath)
		if os.IsNotExist(err) {
			f1, err = os.Create(resultsPath)
		}
		if err != nil {
			return err
		}

		defer f1.Close()

		{
			b, err := ioutil.ReadAll(f1)
			if err != nil {
				return err
			}

			if len(b) > 0 {
				err = json.Unmarshal(b, &results)
				if err != nil {
					return err
				}
			}
		}

		var newScore float64
		if test.Success() {
			newScore = 1
		}

		if _, ok := results["score"]; !ok {
			results["score"] = newScore
		}

		var score float64
		v := results["score"]
		if vv, ok := v.(float64); ok {
			score = vv
		}

		score = (score * 0.99) + (newScore * 0.02) // success increased more than failure decreases

		if score > 1 {
			score = 1
		}

		if score < 0 {
			score = 0
		}

		results["score"] = score

		err = f1.Close()
		if err != nil {
			return err
		}
	}

	{
		f2, err := os.Create(resultsPath)
		if err != nil {
			return err
		}

		defer f2.Close()

		b, err := json.MarshalIndent(results, "", "  ")
		if err != nil {
			return err
		}

		_, err = io.Copy(f2, bytes.NewBuffer(b))
		if err != nil {
			return err
		}

		err = f2.Close()
		if err != nil {
			return err
		}
	}

	return nil
}

func getMapping() (map[string]map[string]map[string]feature.FeatureWithDir, error) {
	f, err := os.Open("lib/mapping.json")
	if err != nil {
		return nil, err
	}

	defer f.Close()

	b, err := ioutil.ReadAll(f)
	if err != nil {
		return nil, err
	}

	out := map[string]map[string]map[string]feature.FeatureWithDir{}

	err = json.Unmarshal(b, &out)
	if err != nil {
		return nil, err
	}

	return out, nil
}
