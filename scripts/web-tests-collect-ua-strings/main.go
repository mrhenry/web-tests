package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/mrhenry/web-tests/scripts/browserstack"
	"github.com/mrhenry/web-tests/scripts/browserua"
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

	browserChunks, err := browsersChunked(processCtx)
	if err != nil {
		log.Fatal(err)
	}

	for i, browsers := range browserChunks {
		if i > 0 {
			time.Sleep(time.Second * 30)
		}

		select {
		case <-processCtx.Done():
			return
		default:
		}

		run(processCtx, runnerCtx, i, browsers)
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

func run(processCtx context.Context, runnerCtx context.Context, chunkIndex int, browsers []browserstack.Browser) {
	doneChan := make(chan bool, 1)
	ctx, cancel := context.WithTimeout(runnerCtx, time.Minute*30)
	defer cancel()

	mu := &sync.Mutex{}
	uas := map[string]*browserua.BrowserUAs{}

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

	sema := semaphore.NewWeighted(5)

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

			browserUAs, err := getUAs(ctx, client, b, sessionName)
			if err != nil {
				log.Println(err) // non-fatal for us
				return
			}

			mu.Lock()
			defer mu.Unlock()
			uas[browserUAs.Key] = browserUAs

		}(browser)
	}

	go func() {
		// Wait for all
		if err := sema.Acquire(ctx, 5); err != nil {
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
	mu.Lock()
	defer mu.Unlock()
	err = updateUAs(uas)
	if err != nil {
		log.Println(err)
	}
}

func getUAs(parentCtx context.Context, client *browserstack.Client, browser browserstack.Browser, sessionName string) (*browserua.BrowserUAs, error) {
	ctx, cancel := context.WithTimeout(parentCtx, time.Minute*2)
	defer cancel()

	caps := client.SetCaps(selenium.Capabilities{
		"browserstack.local": "true",
		"browserstack.video": "false",
		// "browserstack.debug":           "true",
		// "browserstack.console":         "errors",
		// "browserstack.networkLogs":     "errors",
		"build": sessionName,
		"name":  fmt.Sprintf("%s – %s", "Collect UAs", browser.ResultKey()),
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

	uaStrings, secCHUA, err := client.CollectUAs(ctx, caps, browser)
	if err != nil {
		return nil, err
	}

	return &browserua.BrowserUAs{
		Key:     browser.ResultKey(),
		UAs:     uaStrings,
		SecCHUA: secCHUA,
	}, nil
}

func browsersChunked(ctx context.Context) ([][]browserstack.Browser, error) {
	userName := os.Getenv("BROWSERSTACK_USERNAME")
	accessKey := os.Getenv("BROWSERSTACK_ACCESS_KEY")

	client := browserstack.New(browserstack.Config{
		UserName:  userName,
		AccessKey: accessKey,
	})

	browsers, err := client.ReducedBrowsers(ctx)
	if err != nil {
		return nil, err
	}

	chunks := [][]browserstack.Browser{}
	for i := 0; i < len(browsers); i += 20 {
		end := i + 20

		if end > len(browsers) {
			end = len(browsers)
		}

		chunks = append(chunks, browsers[i:end])
	}

	return chunks, nil
}

func updateUAs(uas map[string]*browserua.BrowserUAs) error {
	existing := existingUAs()

	f, err := os.Create("data/uas.json")
	if err != nil {
		return err
	}

	defer f.Close()

	for k, browser := range uas {
		if b, ok := existing[k]; ok {
			b.UAs = append(b.UAs, browser.UAs...)
			b.UAs = uniqueStringSlice(b.UAs)
			b.SecCHUA = browser.SecCHUA
			existing[k] = b
		} else {
			browser.UAs = uniqueStringSlice(browser.UAs)
			existing[k] = browser
		}
	}

	b, err := json.MarshalIndent(existing, "", "  ")
	if err != nil {
		return err
	}

	_, err = f.Write(b)
	if err != nil {
		return err
	}

	return nil
}

func existingUAs() map[string]*browserua.BrowserUAs {

	f, err := os.Open("data/uas.json")
	if err != nil {
		return map[string]*browserua.BrowserUAs{}
	}

	defer f.Close()

	b, err := ioutil.ReadAll(f)
	if err != nil {
		return map[string]*browserua.BrowserUAs{}
	}

	existing := map[string]*browserua.BrowserUAs{}
	err = json.Unmarshal(b, &existing)
	if err != nil {
		return map[string]*browserua.BrowserUAs{}
	}

	return existing
}

func uniqueStringSlice(s []string) []string {
	track := make(map[string]bool, len(s))
	unique := make([]string, 0, len(s))
	for _, elem := range s {
		if elem == "" {
			continue
		}

		if _, ok := track[elem]; !ok {
			unique = append(unique, elem)
			track[elem] = true
		}
	}

	return unique
}
