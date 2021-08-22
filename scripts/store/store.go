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

	err = migrate(context.Background(), db)
	if err != nil {
		return nil, err
	}

	return db, nil
}

//go:embed create_features_table.sql
var createFeaturesTableQuery string

//go:embed create_results_table.sql
var createResultsTableQuery string

//go:embed create_polyfillio_hashes_table.sql
var createPolyfillIOHashesTableQuery string

//go:embed create_user-agents_table.sql
var createUserAgentsTableQuery string

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

	_, err = db.ExecContext(ctx, createPolyfillIOHashesTableQuery)
	if err != nil {
		log.Printf("Error %s when creating polyfillio hashes table", err)
		return err
	}

	_, err = db.ExecContext(ctx, createUserAgentsTableQuery)
	if err != nil {
		log.Printf("Error %s when creating user agents table", err)
		return err
	}

	return nil
}

//go:embed insert_feature.sql
var insertFeatureQuery string

func InsertFeature(ctx context.Context, db *sql.DB, x feature.FeatureInMapping) error {
	notes, _ := json.Marshal(x.Notes)
	polyfillIO, _ := json.Marshal(x.PolyfillIO)
	searchTerms, _ := json.Marshal(x.SearchTerms)
	spec, _ := json.Marshal(x.Spec)

	_, err := db.ExecContext(
		ctx,
		insertFeatureQuery,

		x.ID,

		x.Dir,
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

func UpdateFeature(ctx context.Context, db *sql.DB, x feature.FeatureInMapping) error {
	notes, _ := json.Marshal(x.Notes)
	polyfillIO, _ := json.Marshal(x.PolyfillIO)
	searchTerms, _ := json.Marshal(x.SearchTerms)
	spec, _ := json.Marshal(x.Spec)

	_, err := db.ExecContext(
		ctx,
		updateFeatureQuery,

		x.Dir,
		notes,
		polyfillIO,
		searchTerms,
		spec,

		x.ID,
	)
	if err != nil {
		log.Printf("Error %s when updating a feature", err)
		return err
	}

	return nil
}

//go:embed select_feature.sql
var selectFeatureQuery string

func SelectFeature(ctx context.Context, db *sql.DB, x feature.FeatureInMapping) (feature.FeatureInMapping, error) {
	row := db.QueryRowContext(
		ctx,
		selectFeatureQuery,

		x.ID,
	)
	err := row.Err()
	if err == sql.ErrNoRows {
		return x, err
	}
	if row.Err() != nil {
		log.Printf("Error %s when selecting a feature", err)
		return x, err
	}

	notesStr := ""
	polyfillIOStr := ""
	searchTermsStr := ""
	specStr := ""

	err = row.Scan(&x.Dir, &notesStr, &polyfillIOStr, &searchTermsStr, &specStr)
	if err == sql.ErrNoRows {
		return x, err
	}
	if err != nil {
		log.Printf("Error %s when scanning a selected result", err)
		return x, err
	}

	if notesStr != "" {
		err = json.Unmarshal([]byte(notesStr), &x.Notes)
		if err != nil {
			return x, err
		}
	}

	if polyfillIOStr != "" {
		err = json.Unmarshal([]byte(polyfillIOStr), &x.PolyfillIO)
		if err != nil {
			return x, err
		}
	}

	if searchTermsStr != "" {
		err = json.Unmarshal([]byte(searchTermsStr), &x.SearchTerms)
		if err != nil {
			return x, err
		}
	}

	if specStr != "" {
		err = json.Unmarshal([]byte(specStr), &x.Spec)
		if err != nil {
			return x, err
		}
	}

	return x, nil
}

func ExistsFeature(ctx context.Context, db *sql.DB, x feature.FeatureInMapping) (bool, error) {
	row := db.QueryRowContext(
		ctx,
		selectFeatureQuery,

		x.ID,
	)
	err := row.Err()
	if err == sql.ErrNoRows {
		return false, nil
	}
	if row.Err() != nil {
		log.Printf("Error %s when selecting a result", err)
		return false, err
	}

	return true, nil
}

//go:embed insert_result.sql
var insertResultQuery string

func InsertResult(ctx context.Context, db *sql.DB, x result.Result) error {
	_, err := db.ExecContext(
		ctx,
		insertResultQuery,

		x.BrowserVersion,
		x.Browser,
		x.FeatureID,
		x.OSVersion,
		x.OS,
		x.Test,

		x.Hash,
		x.Priority,
		x.Score,
	)
	if err != nil {
		log.Printf("Error %s when inserting a result", err)
		return err
	}

	return nil
}

//go:embed update_result.sql
var updateResultQuery string

func UpdateResult(ctx context.Context, db *sql.DB, x result.Result) error {
	_, err := db.ExecContext(
		ctx,
		updateResultQuery,

		x.Hash,
		x.Priority,
		x.Score,

		x.BrowserVersion,
		x.Browser,
		x.FeatureID,
		x.OSVersion,
		x.OS,
		x.Test,
	)
	if err != nil {
		log.Printf("Error %s when updating a result", err)
		return err
	}

	return nil
}

//go:embed select_result.sql
var selectResultQuery string

func SelectResult(ctx context.Context, db *sql.DB, x result.Result) (result.Result, error) {
	row := db.QueryRowContext(
		ctx,
		selectResultQuery,

		x.BrowserVersion,
		x.Browser,
		x.FeatureID,
		x.OSVersion,
		x.OS,
		x.Test,
	)
	err := row.Err()
	if err == sql.ErrNoRows {
		return x, err
	}
	if row.Err() != nil {
		log.Printf("Error %s when selecting a result", err)
		return x, err
	}

	err = row.Scan(&x.Hash, &x.Priority, &x.Score)
	if err == sql.ErrNoRows {
		return x, err
	}
	if err != nil {
		log.Printf("Error %s when scanning a selected result", err)
		return x, err
	}

	return x, nil
}

func ExistsResult(ctx context.Context, db *sql.DB, x result.Result) (bool, error) {
	row := db.QueryRowContext(
		ctx,
		selectResultQuery,

		x.BrowserVersion,
		x.Browser,
		x.FeatureID,
		x.OSVersion,
		x.OS,
		x.Test,
	)
	err := row.Err()
	if err == sql.ErrNoRows {
		return false, nil
	}
	if row.Err() != nil {
		log.Printf("Error %s when selecting a result", err)
		return false, err
	}

	return true, nil
}

func GetTestsForBrowser(ctx context.Context, db *sql.DB, browser string, browserVersion string) {
	// get top 10 features by priority
	// get 5 random features
}

func GetBrowsersToTest(ctx context.Context, db *sql.DB, browser string, browserVersion string) {
	// get top 8 browser+version by aggregate priority
	// get 2 random browser+version
}
