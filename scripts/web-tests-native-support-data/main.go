package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"sort"

	version "github.com/hashicorp/go-version"
	"github.com/mrhenry/web-tests/scripts/feature"
	"github.com/mrhenry/web-tests/scripts/result"
	"github.com/mrhenry/web-tests/scripts/store"
)

func main() {
	var featureArg string

	flag.StringVar(&featureArg, "feature", "", "Feature to construct mdn compat data for")

	flag.Parse()

	db, err := store.NewSqliteDatabase("./web-tests.db", true)
	if err != nil {
		log.Fatal(err)
	}
	defer store.CloseDB(db)

	featureInMapping := feature.FeatureInMapping{}
	featureInMapping.ID = featureArg

	feature, err := store.SelectFeature(context.Background(), db, featureInMapping)
	if err != nil {
		log.Fatal(err)
	}

	safari := []result.Result{}
	chrome := []result.Result{}
	firefox := []result.Result{}
	ios := []result.Result{}

	allResultsForFeature, err := store.SelectResultsForFeature(context.Background(), db, feature)
	if err != nil {
		log.Fatal(err)
	}

	for _, r := range allResultsForFeature {
		if r.Test != "pure" {
			continue
		}

		if r.Score == -1 {
			continue
		}

		if r.OS == "ios" {
			r.Browser = "safari_ios"
		}

		switch r.Browser {
		case "safari":
			safari = append(safari, r)
		case "chrome":
			chrome = append(chrome, r)
		case "firefox":
			firefox = append(firefox, r)
		case "safari_ios":
			ios = append(ios, r)
		}
	}

	sort.Sort(Results(safari))
	sort.Sort(Results(chrome))
	sort.Sort(Results(firefox))
	sort.Sort(Results(ios))

	for i := 1; i < len(safari); i++ {
		logResults(safari[i-1], safari[i])
	}

	for i := 1; i < len(chrome); i++ {
		logResults(chrome[i-1], chrome[i])
	}

	for i := 1; i < len(firefox); i++ {
		logResults(firefox[i-1], firefox[i])
	}

	for i := 1; i < len(ios); i++ {
		logResults(ios[i-1], ios[i])
	}
}

type Results []result.Result

func (x Results) Len() int {
	return len(x)
}

func (x Results) Less(i int, j int) bool {
	v1, _ := version.NewVersion(x[i].BrowserVersion)
	v2, _ := version.NewVersion(x[j].BrowserVersion)

	if v1 != nil && v2 != nil {
		return v1.GreaterThan(v2)
	}

	panic("could not compare versions")
}

func (x Results) Swap(i int, j int) {
	x[i], x[j] = x[j], x[i]
}

func logResults(a result.Result, b result.Result) {
	if a.Score == b.Score {
		return
	}

	fmt.Printf("%s %s: %3f\n", a.Browser, a.BrowserVersion, a.Score)
	fmt.Printf("%s %s: %3f\n", b.Browser, b.BrowserVersion, b.Score)
	fmt.Println("-----------------------")
}
