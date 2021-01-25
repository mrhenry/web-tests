package api

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type Browser struct {
	Browser        string `json:"browser"`
	BrowserVersion string `json:"browser_version"`
	Device         string `json:"device"`
	OS             string `json:"os"`
	OSVersion      string `json:"os_version"`
	RealMobile     bool   `json:"real_mobile"`
}

func (x Browser) ResultKey() string {
	if x.Device != "" {
		return fmt.Sprintf("%s/%s", x.OS, x.OSVersion)
	}

	return fmt.Sprintf("%s/%s", x.Browser, x.BrowserVersion)
}

func (x Browser) ResultFilename() string {
	if x.Device != "" {
		return fmt.Sprintf("%s:%s", x.OS, x.OSVersion)
	}

	return fmt.Sprintf("%s:%s", x.Browser, x.BrowserVersion)
}

func (x *Client) ReducedBrowsers(ctx context.Context) ([]Browser, error) {
	browsers, err := x.Browsers(ctx)
	if err != nil {
		return nil, err
	}

	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(browsers), func(i, j int) {
		browsers[i], browsers[j] = browsers[j], browsers[i]
	})

	browsersMap := map[string]Browser{}

	for _, b := range browsers {
		if b.BrowserVersion == "insider preview" {
			continue // not an official release
		}

		if strings.Contains(b.BrowserVersion, "beta") {
			continue // not an official release
		}

		if b.Browser == "edge" {
			parts := strings.Split(b.BrowserVersion, ".")
			if len(parts) > 0 {
				v, err := strconv.ParseInt(parts[0], 10, 64)
				if err == nil && v >= 79 {
					continue // Edge >= 79 is just Chrome
				}
			}
		}

		key, b := browserForReducedSet(b)
		switch key {
		case "ie/6.0":
			continue // too old
		case "ie/7.0":
			continue // too old
		default:

			browsersMap[key] = b
		}
	}

	out := []Browser{}
	for _, b := range browsersMap {
		out = append(out, b)
	}

	return out, nil
}

func browserForReducedSet(b Browser) (string, Browser) {
	if b.Device != "" {
		bb := Browser{
			Device:         b.Device,
			Browser:        b.Browser,
			BrowserVersion: b.BrowserVersion,
			OS:             b.OS,
			OSVersion:      b.OSVersion,
		}

		return bb.ResultKey(), bb
	}

	bb := Browser{
		Browser:        b.Browser,
		BrowserVersion: b.BrowserVersion,
	}

	return bb.ResultKey(), bb
}

func (x *Client) Browsers(parentCtx context.Context) ([]Browser, error) {
	ctx, cancel := context.WithTimeout(parentCtx, time.Second*15)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://api.browserstack.com/automate/browsers.json", nil)
	if err != nil {
		return nil, err
	}

	resp, err := x.http.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	b, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if strings.Contains(string(b), "HTTP Basic: Access denied.") {
		return nil, errors.New("Access denied")
	}

	buf := bytes.NewBuffer(b)

	decoder := json.NewDecoder(buf)

	if resp.StatusCode != 200 {
		apiErr := &Error{}
		err := decoder.Decode(apiErr)
		if err != nil {
			return nil, err
		}

		return nil, apiErr
	}

	apiResp := []Browser{}
	err = decoder.Decode(&apiResp)
	if err != nil {
		return nil, err
	}

	return apiResp, nil
}
