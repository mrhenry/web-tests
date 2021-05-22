package browserstack

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/tebeka/selenium"
)

func (x *Client) CollectUAs(parentCtx context.Context, caps selenium.Capabilities, browser Browser) ([]string, error) {
	select {
	case <-parentCtx.Done():
		return nil, parentCtx.Err()
	default:
	}

	ctx, cancel := context.WithCancel(parentCtx)
	defer cancel()

	uaStrings := []string{}

	mu := &sync.RWMutex{}

	handler := http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		w.Header().Add("Accept-CH", "Sec-CH-UA, UA")

		if req.URL.Path != "" && req.URL.Path != "/" {
			http.Error(w, http.StatusText(http.StatusNotFound), http.StatusNotFound)
			return
		}

		if req.UserAgent() == "" {
			http.Error(w, http.StatusText(http.StatusNotFound), http.StatusNotFound)
			return
		}

		if strings.Contains(browser.ResultKey(), "ios/") && strings.Contains(req.UserAgent(), "Macintosh") {
			w.Write([]byte{})
			return
		}

		mu.RLock()
		defer mu.RUnlock()

		if strings.Contains(req.Header.Get("Accept"), "text/html") {
			uaStrings = append(uaStrings, req.UserAgent())
		} else if strings.Contains(req.UserAgent(), "Trident/4.0") {
			uaStrings = append(uaStrings, req.UserAgent())
		} else {
			// Browserstack has a separate process that also requests the test page.
			// This process has a different UA.
			// The "Accept" header seems to be a good smell.
			log.Println("------------------------------------------------------------------")
			for k, v := range req.Header {
				for _, vv := range v {
					log.Printf("%s – %s : %s", req.URL.Path, k, vv)
				}
			}

			log.Println("-- UA did not request \"text/html\"")
			log.Println("-- " + browser.ResultKey())
			log.Println("------------------------------------------------------------------")
		}

		w.Write([]byte{})
		return
	})

	httpPort, err := newTestServer(ctx, handler)
	if err != nil {
		return nil, err
	}

	var wd selenium.WebDriver
	wdChan := make(chan selenium.WebDriver, 1)

	webDriverStartCtx, webDriverStartCancel := context.WithTimeout(ctx, time.Second*120)
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
		return nil, webDriverStartCtx.Err()
	}

	if wd == nil {
		return nil, errors.New("webdriver remote not started")
	}

	defer wd.Quit()
	defer wd.Close()

	// HTTP
	{
		// First
		select {
		case <-ctx.Done():
			if ctx.Err() == context.DeadlineExceeded {
				log.Println("test run deadline exceeded in SELENIUM_LOOP")
			}

			return nil, err
		default:
			err := wd.Get(fmt.Sprintf("http://bs-local.com:%d/", httpPort))
			if err != nil {
				return nil, err
			}
		}

		// Second
		select {
		case <-ctx.Done():
			if ctx.Err() == context.DeadlineExceeded {
				log.Println("test run deadline exceeded in SELENIUM_LOOP")
			}

			return nil, err
		default:
			err := wd.Get(fmt.Sprintf("http://bs-local.com:%d/", httpPort))
			if err != nil {
				return nil, err
			}
		}
	}

	// TODO : this needs timeout handling
	err = wd.Close()
	if err != nil {
		return nil, err
	}

	// TODO : this needs timeout handling
	err = wd.Quit()
	if err != nil {
		return nil, err
	}

	return uaStrings, nil
}
