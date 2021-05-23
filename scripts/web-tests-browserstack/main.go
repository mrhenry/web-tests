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

	"github.com/hashicorp/go-version"
	ua "github.com/mileusna/useragent"
	"github.com/mrhenry/web-tests/scripts/browserstack"
	"github.com/mrhenry/web-tests/scripts/feature"
	"github.com/tebeka/selenium"
	"golang.org/x/sync/semaphore"
)

func main() {
	processCtx, processCancel := context.WithTimeout(context.Background(), time.Minute*120)
	defer processCancel()

	runnerCtx, runnerCancel := context.WithCancel(processCtx)
	defer runnerCancel()

	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	doneChan := make(chan bool, 1)

	go func() {
		<-sigs
		log.Println("shutting down")
		runnerCancel()

		time.Sleep(time.Second * 30)

		processCancel()

		time.Sleep(time.Second * 10)

		select {
		case doneChan <- true:
		default:
		}
	}()

	var browserFilterArg string
	var testFilterArg string

	flag.StringVar(&browserFilterArg, "browser", "", "Only run on browser")
	flag.StringVar(&testFilterArg, "run", "", "Only run tests matching")

	flag.Parse()

	testChunks, err := testsChunked(testFilterArg)
	if err != nil {
		log.Println(err) // non-fatal for us
		return
	}

	for i, tests := range testChunks {
		if i > 0 {
			time.Sleep(time.Second * 30)
		}

		select {
		case <-processCtx.Done():
			return
		default:
		}

		run(processCtx, runnerCtx, i, tests, browserFilterArg)
	}

	go func() {
		time.Sleep(time.Second * 10)

		select {
		case doneChan <- true:
		default:
		}
	}()

	<-doneChan
}

func run(processCtx context.Context, runnerCtx context.Context, chunkIndex int, tests []browserstack.Test, browserFilter string) {
	doneChan := make(chan bool, 1)
	ctx, cancel := context.WithTimeout(runnerCtx, time.Minute*30)
	defer cancel()

	go func() {
		select {
		case <-runnerCtx.Done():
			time.Sleep(time.Second * 10)

			select {
			case doneChan <- true:
				// noop
				return
			default:
				// noop
				return
			}
		}
	}()

	select {
	case <-processCtx.Done():
		return
	default:
	}

	sessionName := fmt.Sprintf("Web Tests (%d) – %s", chunkIndex, time.Now().Format(time.RFC3339))
	userName := os.Getenv("BROWSERSTACK_USERNAME")
	accessKey := os.Getenv("BROWSERSTACK_ACCESS_KEY")

	mapping, err := getMapping()
	if err != nil {
		log.Println(err)
		return
	}

	client := browserstack.New(browserstack.Config{
		UserName:  userName,
		AccessKey: accessKey,
	})

	done, err := client.OpenTunnel(processCtx)
	defer done()
	if err != nil {
		log.Println(err)
		return
	}

	log.Println("tunnel ready")

	browsers, err := client.ReducedBrowsers(ctx)
	if err != nil {
		log.Println(err)
		return
	}

	if browserFilter != "" {
		filteredBrowsers := []browserstack.Browser{}
		for _, b := range browsers {
			if strings.Contains(strings.ToLower(b.ResultKey()), strings.ToLower(browserFilter)) {
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

	sema := semaphore.NewWeighted(4)

	for _, browser := range browsers {
		if err := sema.Acquire(ctx, 1); err != nil {
			log.Println(err)
			return
		}

		go func(b browserstack.Browser) {
			defer sema.Release(1)

			select {
			case <-runnerCtx.Done():
				return
			default:
			}

			time.Sleep(time.Second * 10)

			err = runTest(ctx, client, b, tests, sessionName, mapping)
			if err != nil {
				log.Println(err) // non-fatal for us
			}
		}(browser)
	}

	go func() {
		// Wait for all
		if err := sema.Acquire(ctx, 4); err != nil {
			log.Println(err)
			return
		}

		err = done()
		if err != nil {
			log.Println(err) // non-fatal for us
		}

		select {
		case doneChan <- true:
			// noop
		default:
			// noop
		}
	}()

	<-doneChan
}

func runTest(parentCtx context.Context, client *browserstack.Client, browser browserstack.Browser, tests []browserstack.Test, sessionName string, mapping feature.Mapping) error {
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
				}
			}
		}
	}()

	err := client.RunTest(ctx, caps, in, out)
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

func writeResults(browser browserstack.Browser, test browserstack.Test, mapping feature.Mapping) error {
	if test.DidRun() == false {
		return nil
	}

	resultsDir := ""
	if item, ok := mapping[test.MappingID()]; ok {
		resultsDir = filepath.Join(item.Dir, "results", test.MappingTestName())
		err := os.MkdirAll(resultsDir, os.ModePerm)
		if err != nil {
			return err
		}
	} else {
		return fmt.Errorf("not found in mapping %s", test.MappingID())
	}

	ua := ua.Parse(test.UserAgent)
	key := ""
	version, err := reallyTolerantSemver(ua.Version)
	if err != nil {
		panic(err)
	}

	browserName := strings.ToLower(browser.Browser)
	if strings.ToLower(browser.OS) == "ios" {
		browserName = "safari"
		key = fmt.Sprintf("ios:%d.%d", version.Segments()[0], version.Segments()[1])
	} else if browserName == "safari" {
		key = fmt.Sprintf("safari:%d.%d", version.Segments()[0], version.Segments()[1])
	} else if browserName == "opera" {
		key = fmt.Sprintf("opera:%d.%d", version.Segments()[0], version.Segments()[1])
	} else {
		key = fmt.Sprintf("%s:%d.0", browserName, version.Segments()[0])
	}

	resultsPath := filepath.Join(resultsDir, fmt.Sprintf("%s.json", key))

	results := map[string]interface{}{
		"os":              browser.OS,
		"os_version":      browser.OSVersion,
		"browser":         browserName,
		"browser_version": fmt.Sprintf("%d.%d", version.Segments()[0], version.Segments()[1]),
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

		var newScore float64 = 0
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
		} else if vv, ok := v.(int); ok {
			score = float64(vv)
		}

		if score > 0.2 && test.Success() {
			// Test is succeeding and seems to be going up.
			score = score + 0.1
		} else if score > 0.1 && test.Success() {
			// Test appears to be succeeding and might to be going up.
			score = score + 0.05
		} else if score < 0.8 && !test.Success() {
			// Test is failing and seems to be going down.
			score = score - 0.1
		} else if score < 0.9 && !test.Success() {
			// Test appears to be failing and might to be going down.
			score = score - 0.05
		} else {
			// Test might go either way.
			score = (score - 0.01) + (newScore * 0.02)
		}

		if score > 1 {
			score = 1
		}

		if score < 0.00099 {
			score = 0
		}

		results["score"] = score
		results["browser"] = strings.ToLower(ua.Name)
		results["browser_version"] = fmt.Sprintf("%d.%d", version.Segments()[0], version.Segments()[1])

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

		_, err = f2.WriteString("\n")
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

func getMapping() (feature.Mapping, error) {
	f, err := os.Open("lib/mapping.json")
	if err != nil {
		return nil, err
	}

	defer f.Close()

	b, err := ioutil.ReadAll(f)
	if err != nil {
		return nil, err
	}

	out := feature.Mapping{}

	err = json.Unmarshal(b, &out)
	if err != nil {
		return nil, err
	}

	return out, nil
}

func testsChunked(testFilter string) ([][]browserstack.Test, error) {
	tests := []browserstack.Test{}
	testPaths, err := getTestPaths()
	if err != nil {
		return nil, err
	}

	mapping, err := getMapping()
	if err != nil {
		return nil, err
	}

	for _, p := range testPaths {
		test := browserstack.Test{
			Path: p,
		}

		if testFilter != "" {
			if item, ok := mapping[test.MappingID()]; ok {
				terms := item.Spec.Org + ":" + item.Spec.ID + ":" + item.Spec.Section + ":" + item.Spec.Name
				for _, x := range item.SearchTerms {
					terms = terms + ":" + x
				}

				if !strings.Contains(strings.ToLower(terms), strings.ToLower(testFilter)) {
					continue
				}
			} else {
				continue
			}
		}

		tests = append(tests, test)
	}

	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(tests), func(i, j int) {
		tests[i], tests[j] = tests[j], tests[i]
	})

	chunks := [][]browserstack.Test{}
	for i := 0; i < len(tests); i += 25 {
		end := i + 25

		if end > len(tests) {
			end = len(tests)
		}

		chunks = append(chunks, tests[i:end])
	}

	if len(chunks) > 10 {
		tests = tests[:10]
	}

	return chunks, nil
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
