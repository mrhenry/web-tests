package api

import (
	"bytes"
	"compress/gzip"
	"context"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/tebeka/selenium"
)

type Test struct {
	Path string

	didRun  bool
	success bool

	err error

	start time.Time
	end   time.Time
}

func (x Test) Err() error {
	return x.err
}

func (x Test) DidRun() bool {
	return x.didRun
}

func (x Test) Success() bool {
	return x.success
}

func (x Test) Duration() time.Duration {
	return x.end.Sub(x.start)
}

func (x Test) MappingOrg() string {
	parts := strings.Split(strings.TrimPrefix(strings.TrimSuffix(x.Path, ".html"), "tests/"), ":")
	return parts[0]
}

func (x Test) MappingID() string {
	parts := strings.Split(strings.TrimPrefix(strings.TrimSuffix(x.Path, ".html"), "tests/"), ":")
	return parts[1]
}

func (x Test) MappingSection() string {
	parts := strings.Split(strings.TrimPrefix(strings.TrimSuffix(x.Path, ".html"), "tests/"), ":")
	return parts[2]
}

func (x Test) MappingTestName() string {
	parts := strings.Split(strings.TrimPrefix(strings.TrimSuffix(x.Path, ".html"), "tests/"), ":")
	return parts[3]
}

func (x *Client) RunTest(parentCtx context.Context, caps selenium.Capabilities, in chan Test, out chan Test) error {
	select {
	case <-parentCtx.Done():
		return parentCtx.Err()
	default:
	}

	ctx, cancel := context.WithCancel(parentCtx)
	defer cancel()

	mu := &sync.RWMutex{}
	wg := &sync.WaitGroup{}

	respMap := map[string][]byte{}

	handler := http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		mu.RLock()
		defer mu.RUnlock()

		if b, ok := respMap[strings.TrimPrefix(req.URL.Path, "/")]; ok {
			w.Header().Set("Content-Type", "text/html; charset=UTF-8")
			w.Header().Set("Content-Encoding", "gzip")

			w.WriteHeader(http.StatusOK)
			w.Write(b)
			return
		}

		http.Error(w, http.StatusText(http.StatusNotFound), http.StatusNotFound)
		return
	})

	runChan := make(chan Test, 10)
	port, err := newTestServer(ctx, handler)
	if err != nil {
		return err
	}

	var wd selenium.WebDriver
	wdChan := make(chan selenium.WebDriver, 1)

	webDriverStartCtx, webDriverStartCancel := context.WithTimeout(ctx, time.Second*30)
	defer webDriverStartCancel()

	go func() {
		wd1, err := selenium.NewRemote(caps, "https://hub-cloud.browserstack.com/wd/hub")
		if err != nil {
			// TODO : create real retries
			if strings.Contains(err.Error(), "Could not start Mobile Browser") {
				time.Sleep(time.Minute)
				wd1, err = selenium.NewRemote(caps, "https://hub-cloud.browserstack.com/wd/hub")
			}

			if err != nil {
				log.Println("new selenium remote : ", err)
				return
			}
		}

		select {
		case <-webDriverStartCtx.Done():
			defer wd1.Quit()
			defer wd1.Close()
		default:
			// noop
		}

		wdChan <- wd1
	}()

	select {
	case wd = <-wdChan:
		// noop
	case <-webDriverStartCtx.Done():
		return webDriverStartCtx.Err()
	}

	if wd == nil {
		return errors.New("webdriver remote not started")
	}

	defer wd.Quit()
	defer wd.Close()

	go func() {
	SELENIUM_LOOP:
		for {
			select {
			case <-ctx.Done():
				return
			case test := <-runChan:
				testDoneChan := make(chan bool, 1)

				go func(test Test) {
					test.didRun = true
					test.start = time.Now()

					err := runSeleniumTest(wd, port, test)
					if err != nil {
						test.err = err
					} else {
						test.success = true
					}

					test.end = time.Now()
					out <- test

					wg.Done()
					testDoneChan <- true
				}(test)

				select {
				case <-ctx.Done():
					return
				case <-testDoneChan:
					continue SELENIUM_LOOP
				}
			}
		}
	}()

HTTP_CACHE_LOOP:
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case test, ok := <-in:
			if !ok {
				break HTTP_CACHE_LOOP
			}

			b, err := ioutil.ReadFile(strings.TrimPrefix(test.Path, "./"))
			if err != nil {
				test.err = err
				out <- test
				continue HTTP_CACHE_LOOP
			}

			buff := bytes.NewBuffer(nil)
			gzipWriter, err := gzip.NewWriterLevel(buff, gzip.BestCompression)
			if err != nil {
				panic(err)
			}

			_, err = gzipWriter.Write(b)
			if err != nil {
				panic(err)
			}

			err = gzipWriter.Flush()
			if err != nil {
				panic(err)
			}

			mu.Lock()
			respMap[strings.TrimPrefix(test.Path, "./")] = buff.Bytes()
			mu.Unlock()

			wg.Add(1)
			runChan <- test
		}
	}

	doneChan := make(chan bool, 1)

	go func() {
		wg.Wait()
		doneChan <- true
	}()

	select {
	case <-doneChan:
		// noop
	case <-ctx.Done():
		// noop
	}

	// TODO : this needs timeout handling
	err = wd.Close()
	if err != nil {
		return err
	}

	// TODO : this needs timeout handling
	err = wd.Quit()
	if err != nil {
		return err
	}

	return nil
}

func runSeleniumTest(wd selenium.WebDriver, port int, test Test) error {
	test.didRun = true

	// TODO : this needs a raced timeout
	err := wd.Get(fmt.Sprintf("http://bs-local.com:%d/%s", port, strings.TrimPrefix(test.Path, "./")))
	if err != nil {
		return err
	}

	ok, err := getBoolFromWebDriver(wd, `return window.testSuccess;`)
	if err != nil {
		return err
	}

	if !ok {
		err = wd.WaitWithTimeoutAndInterval(selenium.Condition(func(wd1 selenium.WebDriver) (bool, error) {
			return getBoolFromWebDriver(wd1, `return (typeof window.testSuccess !== "undefined");`)
		}), time.Second*2, time.Millisecond*100)
		if err != nil {
			return err
		}

		ok, err = getBoolFromWebDriver(wd, `return window.testSuccess;`)
		if err != nil {
			return err
		}
	}

	if !ok {
		return errors.New("selenium test failed")
	}

	return nil
}

func getBoolFromWebDriver(wd selenium.WebDriver, script string) (bool, error) {
	v, err := wd.ExecuteScript(script, nil)
	if err != nil {
		return false, err
	}

	if v == nil {
		return false, nil
	}

	if vv, ok := v.(bool); ok && vv == true {
		return vv, nil
	}

	return false, nil
}

func newTestServer(ctx context.Context, handler http.Handler) (int, error) {
	listener, err := net.Listen("tcp", ":0")
	if err != nil {
		return 0, err
	}

	srv := &http.Server{
		Handler: handler,
	}

	go func() {
		select {
		case <-ctx.Done():
			srv.Close()
		}
	}()

	go func() {
		srv.Serve(listener)
	}()

	return listener.Addr().(*net.TCPAddr).Port, nil
}
