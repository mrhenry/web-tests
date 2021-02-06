package browserstack

import (
	"context"
	"log"
	"os"
	"testing"

	"github.com/tebeka/selenium"
)

func TestRunTest(t *testing.T) {
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
		"browserVersion":               "8",
		"browserName":                  "internet explorer",
		"browserstack.user":            userName,
		"browserstack.key":             accessKey,
		"browserstack.local":           "true",
		"browserstack.localIdentifier": client.localIdentifier,
		"browserstack.video":           "false",
		// "browserstack.debug":           "true",
		// "browserstack.console":         "errors",
		// "browserstack.networkLogs":     "errors",
		"name": "Go Test",
	}

	tests := []Test{
		{Path: "tests/ecma262-13.3.1.3-babel.html"},
		{Path: "tests/ecma262-13.3.1.3-babel_webpack.html"},
		{Path: "tests/ecma262-13.3.1.3-pure.html"},
		{Path: "tests/ecma262-14.7-babel.html"},
		{Path: "tests/ecma262-14.7-babel_webpack.html"},
		{Path: "tests/ecma262-14.7-pure.html"},
		{Path: "tests/ecma262-18.1.1-babel.html"},
		{Path: "tests/ecma262-18.1.1-babel_webpack.html"},
		{Path: "tests/ecma262-18.1.1-pure.html"},
		{Path: "tests/ecma262-6.1.1-babel.html"},
		{Path: "tests/ecma262-6.1.1-babel_webpack.html"},
		{Path: "tests/ecma262-6.1.1-pure.html"},
		{Path: "tests/ecma262-6.1.2-babel.html"},
		{Path: "tests/ecma262-6.1.2-babel_webpack.html"},
		{Path: "tests/ecma262-6.1.2-pure.html"},
		{Path: "tests/ecma262-6.1.3-babel.html"},
		{Path: "tests/ecma262-6.1.3-babel_webpack.html"},
		{Path: "tests/ecma262-6.1.3-pure.html"},
		{Path: "tests/ecma262-6.1.4-babel.html"},
		{Path: "tests/ecma262-6.1.4-babel_webpack.html"},
		{Path: "tests/ecma262-6.1.4-pure.html"},
		{Path: "tests/url-6.2-babel.html"},
		{Path: "tests/url-6.2-babel_webpack.html"},
		{Path: "tests/url-6.2-pure.html"},
	}

	in := make(chan Test, len(tests))
	out := make(chan Test, len(tests))

	go func() {
		for _, test := range tests {
			in <- test
		}

		close(in)
	}()

	go func() {
		for {
			select {
			case test, ok := <-out:
				if !ok {
					return
				}

				log.Println(test.Path, test.Success(), test.Duration())
			}
		}
	}()

	err = client.RunTest(context.Background(), caps, in, out)
	if err != nil {
		t.Fatal(err)
	}

	err = done()
	if err != nil {
		t.Fatal(err)
	}
}
