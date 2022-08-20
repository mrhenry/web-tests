package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	version "github.com/hashicorp/go-version"
)

func getUsageData(parentCtx context.Context) (*UsageData, error) {
	ctx, cancel := context.WithTimeout(parentCtx, time.Second*30)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://raw.githubusercontent.com/Fyrd/caniuse/master/fulldata-json/data-2.0.json", nil)
	if err != nil {
		return nil, err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	data := &UsageData{}
	decoder := json.NewDecoder(resp.Body)

	err = decoder.Decode(data)
	if err != nil {
		return nil, err
	}

	err = resp.Body.Close()
	if err != nil {
		return nil, err
	}

	out := &UsageData{
		Agents: map[string]struct {
			Browser     string             `json:"browser"`
			Abbr        string             `json:"abbr"`
			Prefix      string             `json:"prefix"`
			Type        string             `json:"type"`
			UsageGlobal map[string]float64 `json:"usage_global"`
		}{},
	}

	for k, v := range data.Agents {
		usageGlobalByMajorVersion := map[string]float64{}
		for version, usage := range v.UsageGlobal {
			if strings.Contains(version, "-") {
				version = strings.Split(version, "-")[0]
			}

			parsedVersion, err := reallyTolerantSemver(version)
			if err != nil {
				continue
			}

			major := fmt.Sprint(parsedVersion.Segments()[0])
			minor := fmt.Sprint(parsedVersion.Segments()[1])

			significantVersion := major
			if k == "ios_saf" {
				significantVersion = fmt.Sprintf("%s.%s", major, minor)
			}
			if strings.ToLower(k) == "safari" {
				significantVersion = fmt.Sprintf("%s.%s", major, minor)
			}

			majorUsage, ok := usageGlobalByMajorVersion[significantVersion]
			if ok {
				majorUsage = majorUsage + usage
			} else {
				majorUsage = usage
			}

			usageGlobalByMajorVersion[significantVersion] = majorUsage
		}

		v.UsageGlobal = usageGlobalByMajorVersion

		if k == "ios_saf" {
			out.Agents["ios"] = v
		} else {
			out.Agents[strings.ToLower(k)] = v
		}
	}

	return out, nil
}

type UsageData struct {
	Agents map[string]struct {
		Browser     string             `json:"browser"`
		Abbr        string             `json:"abbr"`
		Prefix      string             `json:"prefix"`
		Type        string             `json:"type"`
		UsageGlobal map[string]float64 `json:"usage_global"`
	} `json:"agents"`
}

func weightScoreByUsageDataForBrowserWithVersion(usageData *UsageData, browserWithVersion string, score float64) float64 {
	if score > 0.9 {
		score = 1
	} else {
		score = 0
	}

	if usageData == nil {
		return score
	}

	parts := strings.Split(browserWithVersion, "/")
	if len(parts) != 2 {
		return score
	}

	if parts[0] == "android" {
		// Android is weird in browserstack, settings usage to 0 will cause the test result to be omitted from total scores
		return score
	}

	a, err := reallyTolerantSemver(parts[1])
	if err != nil {
		return score
	}

	major := fmt.Sprint(a.Segments()[0])
	minor := fmt.Sprint(a.Segments()[1])

	significantVersion := major
	if parts[0] == "ios" || parts[0] == "safari" {
		significantVersion = fmt.Sprintf("%s.%s", major, minor)
	}

	agent, ok := usageData.Agents[parts[0]]
	if !ok {
		return score
	}

	if usage, ok := agent.UsageGlobal[significantVersion]; ok {
		other := 1 - (usage / 100)
		this := score * (usage / 100)
		return other + this
	}

	return score
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
