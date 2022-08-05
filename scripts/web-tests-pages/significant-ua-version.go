package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"

	"github.com/hashicorp/go-version"
	ua "github.com/mileusna/useragent"
	"github.com/mrhenry/web-tests/scripts/result"
	"github.com/mrhenry/web-tests/scripts/store"
)

var known_iOS_versions = []*version.Version{
	version.Must(version.NewVersion("15.6.0")),
	version.Must(version.NewVersion("15.5.0")),
	version.Must(version.NewVersion("15.4.0")),
	version.Must(version.NewVersion("15.3.0")),
	version.Must(version.NewVersion("15.2.0")),
	version.Must(version.NewVersion("15.1.0")),
	version.Must(version.NewVersion("15.0.0")),
	version.Must(version.NewVersion("14.5.0")),
	version.Must(version.NewVersion("14.0.0")),
	version.Must(version.NewVersion("13.4.0")),
	version.Must(version.NewVersion("13.0.0")),
	version.Must(version.NewVersion("12.2.0")),
	version.Must(version.NewVersion("12.0.0")),
	version.Must(version.NewVersion("11.3.0")),
	version.Must(version.NewVersion("11.0.0")),
	version.Must(version.NewVersion("10.3.0")),
	version.Must(version.NewVersion("10.0.0")),
	version.Must(version.NewVersion("9.3.0")),
	version.Must(version.NewVersion("9.0.0")),
	version.Must(version.NewVersion("8.0.0")),
	version.Must(version.NewVersion("7.0.0")),
	version.Must(version.NewVersion("6.0.0")),
	version.Must(version.NewVersion("5.1.0")),
	version.Must(version.NewVersion("4.2.0")),
	version.Must(version.NewVersion("3.2.0")),
	version.Must(version.NewVersion("3.0.0")),
	version.Must(version.NewVersion("2.0.0")),
	version.Must(version.NewVersion("1.0.0")),
}

func significantUAVersionMapper(ctx context.Context, db *sql.DB) (func(x result.Result) string, error) {
	userAgents, err := store.SelectAllUserAgents(ctx, db)
	if err != nil {
		return nil, err
	}

	first_iOS_versions := map[string]*version.Version{}

	for _, userAgent := range userAgents {
		if userAgent.OS == "ios" {
			parsedUA := ua.Parse(userAgent.UserAgent)

			osVersion, err := reallyTolerantSemver(parsedUA.OSVersion)
			if err != nil {
				log.Fatal(err)
			}

			for _, osVersionCandidate := range known_iOS_versions {
				if osVersion.Segments()[0] == osVersionCandidate.Segments()[0] && (osVersion.GreaterThan(osVersionCandidate) || osVersion.Equal(osVersionCandidate)) {
					osVersion = osVersionCandidate
					break
				}
			}

			existing := first_iOS_versions[fmt.Sprintf("%s/%s", userAgent.Browser, userAgent.BrowserVersion)]
			if existing == nil {
				first_iOS_versions[fmt.Sprintf("%s/%s", userAgent.Browser, userAgent.BrowserVersion)] = osVersion
			} else {
				if osVersion.LessThan(existing) {
					first_iOS_versions[fmt.Sprintf("%s/%s", userAgent.Browser, userAgent.BrowserVersion)] = osVersion
				}
			}
		}
	}

	return func(x result.Result) string {
		if x.OS == "ios" {
			osVersion := first_iOS_versions[fmt.Sprintf("%s/%s", x.Browser, x.BrowserVersion)]
			if osVersion != nil {
				return fmt.Sprintf(
					"%s/%d.%d",
					x.OS,
					osVersion.Segments()[0],
					osVersion.Segments()[1],
				)
			}

			return fmt.Sprintf(
				"%s/%s.%d",
				x.OS,
				x.OSVersion,
				0,
			)
		}

		if x.Browser == "safari" {
			return fmt.Sprintf("%s/%s", x.Browser, x.BrowserVersion)
		}

		browserVersion, err := reallyTolerantSemver(x.BrowserVersion)
		if err != nil {
			return fmt.Sprintf("%s/%s", x.Browser, x.BrowserVersion)
		}

		return fmt.Sprintf("%s/%d", x.Browser, browserVersion.Segments()[0])
	}, nil
}
