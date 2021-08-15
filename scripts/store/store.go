package store

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	_ "embed"

	_ "github.com/mattn/go-sqlite3"
	"github.com/mrhenry/web-tests/scripts/feature"
	"github.com/mrhenry/web-tests/scripts/result"
)

func NewSqliteDatabase(path string, readOnly bool) (*sql.DB, error) {
	var args string
	if readOnly {
		args = fmt.Sprintf("file:%s?mode=ro", path)
	} else {
		args = fmt.Sprintf("file:%s", path)
	}

	db, err := sql.Open("sqlite3", args)
	if err != nil {
		return nil, err
	}

	return db, nil
}

//go:embed create_features_table.sql
var createFeaturesTableQuery string

//go:embed create_results_table.sql
var createResultsTableQuery string

func migrate(ctx context.Context, db *sql.DB) error {
	ctx, cancelfunc := context.WithTimeout(ctx, 5*time.Second)
	defer cancelfunc()

	_, err := db.ExecContext(ctx, createFeaturesTableQuery)
	if err != nil {
		log.Printf("Error %s when creating features table", err)
		return err
	}

	_, err = db.ExecContext(ctx, createResultsTableQuery)
	if err != nil {
		log.Printf("Error %s when creating features table", err)
		return err
	}

	return nil
}

//go:embed insert_feature.sql
var insertFeatureQuery string

func InsertFeature(ctx context.Context, db *sql.DB, feature feature.FeatureInMapping) error {
	notes, _ := json.Marshal(feature.Notes)
	polyfillIO, _ := json.Marshal(feature.PolyfillIO)
	searchTerms, _ := json.Marshal(feature.SearchTerms)
	spec, _ := json.Marshal(feature.Spec)

	_, err := db.ExecContext(
		ctx,
		insertFeatureQuery,

		feature.ID,

		feature.Dir,
		notes,
		polyfillIO,
		searchTerms,
		spec,
	)
	if err != nil {
		log.Printf("Error %s when inserting a feature", err)
		return err
	}

	return nil
}

//go:embed update_feature.sql
var updateFeatureQuery string

func UpdateFeature(ctx context.Context, db *sql.DB, feature feature.FeatureInMapping) error {
	notes, _ := json.Marshal(feature.Notes)
	polyfillIO, _ := json.Marshal(feature.PolyfillIO)
	searchTerms, _ := json.Marshal(feature.SearchTerms)
	spec, _ := json.Marshal(feature.Spec)

	_, err := db.ExecContext(
		ctx,
		updateFeatureQuery,

		feature.Dir,
		notes,
		polyfillIO,
		searchTerms,
		spec,

		feature.ID,
	)
	if err != nil {
		log.Printf("Error %s when updating a feature", err)
		return err
	}

	return nil
}

//go:embed insert_result.sql
var insertResultQuery string

func InsertResult(ctx context.Context, db *sql.DB, result result.Result) error {
	_, err := db.ExecContext(
		ctx,
		insertResultQuery,

		result.BrowserVersion,
		result.Browser,
		result.FeatureID,
		result.OSVersion,
		result.OS,
		result.Test,

		result.Hash,
		result.Priority,
		result.Score,
	)
	if err != nil {
		log.Printf("Error %s when inserting a result", err)
		return err
	}

	return nil
}

//go:embed update_result.sql
var updateResultQuery string

func UpdateResult(ctx context.Context, db *sql.DB, result result.Result) error {
	_, err := db.ExecContext(
		ctx,
		updateResultQuery,

		result.Hash,
		result.Priority,
		result.Score,

		result.BrowserVersion,
		result.Browser,
		result.FeatureID,
		result.OSVersion,
		result.OS,
		result.Test,
	)
	if err != nil {
		log.Printf("Error %s when updating a result", err)
		return err
	}

	return nil
}

func GetTestsForBrowser(ctx context.Context, db *sql.DB, browser string, browserVersion string) {
	// get top 10 features by priority
	// get 5 random features
}

func GetBrowsersToTest(ctx context.Context, db *sql.DB, browser string, browserVersion string) {
	// get top 8 browser+version by aggregate priority
	// get 2 random browser+version
}
