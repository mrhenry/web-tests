package browserstack

import (
	"context"
	"log"
	"os"
	"testing"
	"time"

	"github.com/tebeka/selenium"
)

func TestOpenTunnel(t *testing.T) {
	userName := os.Getenv("BROWSERSTACK_USERNAME")
	accessKey := os.Getenv("BROWSERSTACK_ACCESS_KEY")

	client := New(Config{
		UserName:  userName,
		AccessKey: accessKey,
	})

	done, err := client.OpenTunnel(context.Background())
	defer done()

	if err != nil {
		t.Fatal(err)
	}

	log.Println("tunnel ready")

	caps := selenium.Capabilities{
		// "deviceName: browserObject.device,
		// "platformName":             "Windows",
		// "platformVersion":          "10",
		"browserVersion":               "84",
		"browserName":                  "chrome",
		"browserstack.user":            userName,
		"browserstack.key":             accessKey,
		"browserstack.local":           "true",
		"browserstack.localIdentifier": client.localIdentifier,
		"browserstack.video":           "true",
		"browserstack.debug":           "true",
		"browserstack.console":         "errors",
		"browserstack.networkLogs":     "errors",
		"name":                         "Go Test",
	}

	wd, err := selenium.NewRemote(caps, "https://hub-cloud.browserstack.com/wd/hub")
	if err != nil {
		t.Fatal(err)
	}

	// err = wd.Refresh()
	// if err != nil {
	// 	t.Fatal(err)
	// }

	err = wd.Get("http://bs-local.com:8080/tests/ecma262-13.3.1.3-pure.html")
	if err != nil {
		t.Fatal(err)
	}

	err = wd.WaitWithTimeoutAndInterval(selenium.Condition(func(wd1 selenium.WebDriver) (bool, error) {
		v, err := wd1.ExecuteScript(`return window.testSuccess;`, nil)
		if err != nil {
			return false, err
		}

		if v == nil {
			return false, nil
		}

		if vv, ok := v.(bool); ok {
			return vv, nil
		}

		return false, nil
	}), time.Second*5, time.Millisecond*100)
	if err != nil {
		t.Fatal(err)
	}

	err = wd.Close()
	if err != nil {
		t.Fatal(err)
	}

	// _, err = client.LocalState(context.Background())
	// if err != nil {
	// 	t.Fatal(err)
	// }

	err = done()
	if err != nil {
		t.Fatal(err)
	}
}
