package store

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"path"
	"sort"
	"strings"
	"time"

	_ "embed"

	_ "github.com/mattn/go-sqlite3"
	"github.com/mrhenry/web-tests/scripts/browserstack"
	"github.com/mrhenry/web-tests/scripts/browserua"
	"github.com/mrhenry/web-tests/scripts/feature"
	"github.com/mrhenry/web-tests/scripts/priority"
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

func CloseDB(db *sql.DB) {
	_, err := db.Exec("VACUUM")
	if err != nil {
		log.Println(err)
	}

	err = db.Close()
	if err != nil {
		log.Println(err)
	}
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

func UpsertFeature(ctx context.Context, db *sql.DB, x feature.FeatureInMapping) error {
	ok, err := ExistsFeature(ctx, db, x)
	if err != nil {
		return err
	}

	if ok {
		return UpdateFeature(ctx, db, x)
	}

	sort.Strings(x.PolyfillIO)

	notes, _ := json.Marshal(x.Notes)
	polyfillIO, _ := json.Marshal(x.PolyfillIO)
	searchTerms, _ := json.Marshal(x.SearchTerms)
	spec, _ := json.Marshal(x.Spec)
	tests, _ := json.Marshal(x.Tests)

	_, err = db.ExecContext(
		ctx,
		insertFeatureQuery,

		x.ID,

		x.Dir,
		notes,
		polyfillIO,
		searchTerms,
		spec,
		tests,
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
	sort.Strings(x.PolyfillIO)

	notes, err := json.Marshal(x.Notes)
	if err != nil {
		panic(err)
	}
	polyfillIO, err := json.Marshal(x.PolyfillIO)
	if err != nil {
		panic(err)
	}
	searchTerms, err := json.Marshal(x.SearchTerms)
	if err != nil {
		panic(err)
	}
	spec, err := json.Marshal(x.Spec)
	if err != nil {
		panic(err)
	}
	tests, err := json.Marshal(x.Tests)
	if err != nil {
		panic(err)
	}

	_, err = db.ExecContext(
		ctx,
		updateFeatureQuery,

		x.Dir,
		notes,
		polyfillIO,
		searchTerms,
		spec,
		tests,

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
	testsStr := ""

	err = row.Scan(&x.Dir, &notesStr, &polyfillIOStr, &searchTermsStr, &specStr, &testsStr)
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

		sort.Strings(x.PolyfillIO)
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

	if testsStr != "" {
		err = json.Unmarshal([]byte(testsStr), &x.Tests)
		if err != nil {
			return x, err
		}
	}

	return x, nil
}

//go:embed select_all_features.sql
var selectAllFeaturesQuery string

func SelectAllFeatures(ctx context.Context, db *sql.DB) ([]feature.FeatureInMapping, error) {
	rows, err := db.QueryContext(
		ctx,
		selectAllFeaturesQuery,
	)
	if err == sql.ErrNoRows {
		return []feature.FeatureInMapping{}, nil
	}
	if err != nil {
		return nil, err
	}

	features := []feature.FeatureInMapping{}
	for rows.Next() {
		x := feature.FeatureInMapping{}
		notesStr := ""
		polyfillIOStr := ""
		searchTermsStr := ""
		specStr := ""
		testsStr := ""

		err = rows.Scan(&x.ID, &x.Dir, &notesStr, &polyfillIOStr, &searchTermsStr, &specStr, &testsStr)
		if err == sql.ErrNoRows {
			return nil, err
		}
		if err != nil {
			log.Printf("Error %s when scanning a selected feature", err)
			return nil, err
		}

		if notesStr != "" {
			err = json.Unmarshal([]byte(notesStr), &x.Notes)
			if err != nil {
				return nil, err
			}
		}

		if polyfillIOStr != "" {
			err = json.Unmarshal([]byte(polyfillIOStr), &x.PolyfillIO)
			if err != nil {
				return nil, err
			}

			sort.Strings(x.PolyfillIO)
		}

		if searchTermsStr != "" {
			err = json.Unmarshal([]byte(searchTermsStr), &x.SearchTerms)
			if err != nil {
				return nil, err
			}
		}

		if specStr != "" {
			err = json.Unmarshal([]byte(specStr), &x.Spec)
			if err != nil {
				return nil, err
			}
		}

		if testsStr != "" {
			err = json.Unmarshal([]byte(testsStr), &x.Tests)
			if err != nil {
				return nil, err
			}
		}

		features = append(features, x)
	}

	if rows.Err() != nil {
		log.Printf("Error %s when scanning all features", err)
		return nil, err
	}

	return features, nil
}

//go:embed exists_feature.sql
var existsFeatureQuery string

func ExistsFeature(ctx context.Context, db *sql.DB, x feature.FeatureInMapping) (bool, error) {
	count := 0

	row := db.QueryRowContext(
		ctx,
		existsFeatureQuery,

		x.ID,
	)
	err := row.Err()
	if err == sql.ErrNoRows {
		return false, nil
	}
	if row.Err() != nil {
		log.Printf("Error %s when checking if feature exists", err)
		return false, err
	}
	err = row.Scan(&count)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		log.Printf("Error %s when checking if feature exists", err)
		return false, err
	}

	return count > 0, nil
}

//go:embed insert_result.sql
var insertResultQuery string

func UpsertResult(ctx context.Context, db *sql.DB, x result.Result) error {
	ok, err := ExistsResult(ctx, db, x)
	if err != nil {
		return err
	}

	if ok {
		return UpdateResultWithPriorityShift(ctx, db, x)
	}

	x.Priority = 5

	_, err = db.ExecContext(
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

func UpdateResultWithPriorityShift(ctx context.Context, db *sql.DB, x result.Result) error {
	existing := result.Result{
		BrowserVersion: x.BrowserVersion,
		Browser:        x.Browser,
		FeatureID:      x.FeatureID,
		OSVersion:      x.OSVersion,
		OS:             x.OS,
		Test:           x.Test,
	}

	existing, err := SelectResult(ctx, db, x)
	if err != nil {
		return err
	}

	if x.Score == -1 {
		x.Score = existing.Score
	} else if existing.Score == x.Score {
		x.Priority = x.Priority - 1
		if x.Priority < 0 {
			x.Priority = 0
		}
	} else {
		x.Priority = x.Priority + 1
		if x.Priority > 10 {
			x.Priority = 10
		}
	}

	_, err = db.ExecContext(
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

//go:embed exists_result.sql
var existsResultQuery string

func ExistsResult(ctx context.Context, db *sql.DB, x result.Result) (bool, error) {
	count := 0

	row := db.QueryRowContext(
		ctx,
		existsResultQuery,

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

	err = row.Scan(&count)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		log.Printf("Error %s when scanning a selected result", err)
		return false, err
	}

	return count > 0, nil
}

//go:embed insert_user-agent.sql
var insertUserAgentQuery string

func InsertUserAgent(ctx context.Context, db *sql.DB, x browserua.UserAgent) error {
	_, err := db.ExecContext(
		ctx,
		insertUserAgentQuery,

		x.BrowserVersion,
		x.Browser,
		x.OSVersion,
		x.OS,
		x.UserAgent,
		x.BrowserStack,
	)
	if err != nil {
		log.Printf("Error %s when inserting a user agent", err)
		return err
	}

	return nil
}

//go:embed select_all_user-agents.sql
var selectAllUserAgentsQuery string

func SelectAllUserAgents(ctx context.Context, db *sql.DB) ([]browserua.UserAgent, error) {
	rows, err := db.QueryContext(
		ctx,
		selectAllUserAgentsQuery,
	)
	if err == sql.ErrNoRows {
		return []browserua.UserAgent{}, nil
	}
	if err != nil {
		return nil, err
	}

	uas := []browserua.UserAgent{}
	for rows.Next() {
		ua := browserua.UserAgent{}
		err = rows.Scan(&ua.BrowserVersion, &ua.Browser, &ua.OSVersion, &ua.OS, &ua.UserAgent, &ua.BrowserStack)
		if err != nil {
			log.Printf("Error %s when scanning all user agents", err)
			return nil, err
		}

		uas = append(uas, ua)
	}

	if rows.Err() != nil {
		log.Printf("Error %s when scanning all user agents", err)
		return nil, err
	}

	return uas, nil
}

//go:embed select_all_user-agents_for_browser.sql
var selectAllUserAgentsForBrowserQuery string

func SelectAllUserAgentsForBrowser(ctx context.Context, db *sql.DB, browser browserua.UserAgent) ([]browserua.UserAgent, error) {
	rows, err := db.QueryContext(
		ctx,
		selectAllUserAgentsForBrowserQuery,
		browser.BrowserVersion,
		browser.Browser,
		browser.OSVersion,
		browser.OS,
	)
	if err == sql.ErrNoRows {
		return []browserua.UserAgent{}, nil
	}
	if err != nil {
		return nil, err
	}

	uas := []browserua.UserAgent{}
	for rows.Next() {
		ua := browserua.UserAgent{}
		err = rows.Scan(&ua.UserAgent, &ua.BrowserStack)
		if err != nil {
			log.Printf("Error %s when scanning all user agents for browser", err)
			return nil, err
		}

		uas = append(uas, ua)
	}

	if rows.Err() != nil {
		log.Printf("Error %s when scanning all user agents for browser", err)
		return nil, err
	}

	return uas, nil
}

//go:embed select_all_browsers.sql
var selectAllBrowsersQuery string

func SelectAllBrowsers(ctx context.Context, db *sql.DB) ([]browserua.UserAgent, error) {
	rows, err := db.QueryContext(
		ctx,
		selectAllBrowsersQuery,
	)
	if err == sql.ErrNoRows {
		return []browserua.UserAgent{}, nil
	}
	if err != nil {
		return nil, err
	}

	uas := []browserua.UserAgent{}
	for rows.Next() {
		ua := browserua.UserAgent{}
		err = rows.Scan(&ua.BrowserVersion, &ua.Browser, &ua.OSVersion, &ua.OS, &ua.UserAgent, &ua.BrowserStack)
		if err != nil {
			log.Printf("Error %s when scanning all browsers", err)
			return nil, err
		}

		uas = append(uas, ua)
	}

	if rows.Err() != nil {
		log.Printf("Error %s when scanning all browsers", err)
		return nil, err
	}

	return uas, nil
}

//go:embed select_browsers_by_priority.sql
var selectBrowsersByPriorityQuery string

func SelectBrowsersByPriority(ctx context.Context, db *sql.DB, allBrowsers []browserstack.Browser) ([]browserstack.Browser, error) {
	rows, err := db.QueryContext(
		ctx,
		selectBrowsersByPriorityQuery,
	)
	if err == sql.ErrNoRows {
		return allBrowsers, nil
	}
	if err != nil {
		return nil, err
	}

	uas := []browserua.UserAgent{}
	for rows.Next() {
		ua := browserua.UserAgent{}
		err = rows.Scan(&ua.BrowserVersion, &ua.Browser, &ua.OSVersion, &ua.OS)
		if err != nil {
			log.Printf("Error %s when scanning all user agents by priority", err)
			return nil, err
		}

		uas = append(uas, ua)
	}

	if rows.Err() != nil {
		log.Printf("Error %s when scanning all user agents by priority", err)
		return nil, err
	}

	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(uas), func(i, j int) {
		uas[i], uas[j] = uas[j], uas[i]
	})

	out := []browserstack.Browser{}

UA_LOOP:
	for _, ua := range uas {
		ua := ua
		for _, browser := range allBrowsers {
			if ua.OS == browser.OS && ua.OS != "" && ua.OSVersion != "" && ua.OS == "ios" {
				if strings.Split(ua.OSVersion, ".")[0] == strings.Split(browser.OSVersion, ".")[0] {
					browser.RealBrowser = &ua
					out = append(out, browser)
					continue UA_LOOP
				}
			}

			if ua.Browser == browser.Browser && ua.Browser != "" && ua.BrowserVersion != "" && ua.OS != "ios" && browser.OS != "ios" {
				if strings.Split(ua.BrowserVersion, ".")[0] == strings.Split(browser.BrowserVersion, ".")[0] {
					browser.RealBrowser = &ua
					out = append(out, browser)
					continue UA_LOOP
				}
			}
		}
	}

	return out, nil
}

//go:embed select_results_for_ua_and_polyfill_list.sql
var selectResultsForUAAndPolyfillListQuery string

func SelectResultsForUAAndPolyfillList(ctx context.Context, db *sql.DB, ua browserua.UserAgent, polyfillList string) ([]result.Result, error) {
	rows, err := db.QueryContext(
		ctx,
		selectResultsForUAAndPolyfillListQuery,
		ua.UserAgent,
		"%"+polyfillList+"%",
	)
	if err == sql.ErrNoRows {
		return []result.Result{}, nil
	}
	if err != nil {
		return nil, err
	}

	results := []result.Result{}
	for rows.Next() {
		r := result.Result{}
		err = rows.Scan(
			&r.BrowserVersion,
			&r.Browser,
			&r.FeatureID,
			&r.OSVersion,
			&r.OS,
			&r.Test,
			&r.Hash,
			&r.Priority,
			&r.Score,
		)
		if err != nil {
			log.Printf("Error %s when scanning results for ua", err)
			return nil, err
		}

		results = append(results, r)
	}

	if rows.Err() != nil {
		log.Printf("Error %s when scanning results for ua", err)
		return nil, err
	}

	return results, nil
}

//go:embed select_results_for_feature.sql
var selectResultsForFeatureQuery string

func SelectResultsForFeature(ctx context.Context, db *sql.DB, feature feature.FeatureInMapping) ([]result.Result, error) {
	rows, err := db.QueryContext(
		ctx,
		selectResultsForFeatureQuery,
		feature.ID,
	)
	if err == sql.ErrNoRows {
		return []result.Result{}, nil
	}
	if err != nil {
		return nil, err
	}

	results := []result.Result{}
	for rows.Next() {
		r := result.Result{}
		err = rows.Scan(
			&r.BrowserVersion,
			&r.Browser,
			&r.FeatureID,
			&r.OSVersion,
			&r.OS,
			&r.Test,
			&r.Hash,
			&r.Priority,
			&r.Score,
		)
		if err != nil {
			log.Printf("Error %s when scanning results for feature", err)
			return nil, err
		}

		results = append(results, r)
	}

	if rows.Err() != nil {
		log.Printf("Error %s when scanning results for feature", err)
		return nil, err
	}

	return results, nil
}

//go:embed insert_polyfillio_hash.sql
var insertPolyfillIOHashQuery string

func InsertPolyfillIOHash(ctx context.Context, db *sql.DB, x priority.PolyfillIOHash) error {
	sort.Strings(x.List)
	list, err := json.Marshal(x.List)
	if err != nil {
		panic(err)
	}

	existing := priority.PolyfillIOHash{
		List: x.List,
		UA:   x.UA,
	}
	existing, err = SelectPolyfillIOHash(ctx, db, existing)
	if err == sql.ErrNoRows {
		_, err = db.ExecContext(
			ctx,
			insertPolyfillIOHashQuery,

			list,
			x.UA,

			x.Hash,
		)
		if err != nil {
			log.Printf("Error %s when inserting a polyfill.io hash", err)
			return err
		}

		return nil
	}

	if existing.Hash == x.Hash {
		return nil
	}

	_, err = db.ExecContext(
		ctx,
		insertPolyfillIOHashQuery,

		list,
		x.UA,

		x.Hash,
	)
	if err != nil {
		log.Printf("Error %s when inserting a polyfill.io hash", err)
		return err
	}

	results, err := SelectResultsForUAAndPolyfillList(ctx, db, browserua.UserAgent{UserAgent: x.UA}, string(list))
	if err != nil {
		return err
	}

	for _, r := range results {
		if !strings.HasSuffix(r.Test, "_polyfillio") {
			continue
		}

		r.Priority = r.Priority + 1
		if r.Priority > 10 {
			r.Priority = 10
		}
		err = UpdateResult(ctx, db, r)
		if err != nil {
			return err
		}
	}

	return nil
}

//go:embed select_polyfillio_hash.sql
var selectPolyfillIOHashQuery string

func SelectPolyfillIOHash(ctx context.Context, db *sql.DB, x priority.PolyfillIOHash) (priority.PolyfillIOHash, error) {
	sort.Strings(x.List)
	list, err := json.Marshal(x.List)
	if err != nil {
		panic(err)
	}

	row := db.QueryRowContext(
		ctx,
		selectPolyfillIOHashQuery,

		list,
		x.UA,
	)
	err = row.Err()
	if err == sql.ErrNoRows {
		return x, err
	}
	if row.Err() != nil {
		log.Printf("Error %s when selecting a polyfill.io hash", err)
		return x, err
	}

	err = row.Scan(&x.Hash)
	if err == sql.ErrNoRows {
		return x, err
	}
	if err != nil {
		log.Printf("Error %s when scanning a selected polyfill.io hash", err)
		return x, err
	}

	return x, nil
}

//go:embed select_results_by_browser_and_priority.sql
var selectResultsByBrowserAndPriorityQuery string

func SelectTestsByBrowserAndPriority(ctx context.Context, db *sql.DB, browser browserua.UserAgent) ([]browserstack.Test, error) {
	rows, err := db.QueryContext(
		ctx,
		selectResultsByBrowserAndPriorityQuery,
		browser.Browser,
		browser.BrowserVersion,
		browser.OS,
		browser.OSVersion,
	)
	if err == sql.ErrNoRows {
		return []browserstack.Test{}, nil
	}
	if err != nil {
		return nil, err
	}

	tests := []browserstack.Test{}
	for rows.Next() {
		result := result.Result{}
		err = rows.Scan(&result.FeatureID, &result.Test)
		if err != nil {
			log.Printf("Error %s when scanning results by browser and priority", err)
			return nil, err
		}

		tests = append(tests, browserstack.Test{
			Path: path.Join("./tests", fmt.Sprintf("%s:%s.html", result.FeatureID, result.Test)),
		})
	}

	if rows.Err() != nil {
		log.Printf("Error %s results by browser and priority", err)
		return nil, err
	}

	return tests, nil
}

//go:embed select_sum_results_priority.sql
var selectSumResultsPriorityQuery string

func SelectSumResultsPriority(ctx context.Context, db *sql.DB) (int, error) {
	sum := 0

	row := db.QueryRowContext(
		ctx,
		selectSumResultsPriorityQuery,
	)
	err := row.Err()
	if err == sql.ErrNoRows {
		return -1, nil
	}
	if row.Err() != nil {
		log.Printf("Error %s when selecting the sum of results priority", err)
		return -1, err
	}
	err = row.Scan(&sum)
	if err == sql.ErrNoRows {
		return -1, nil
	}
	if err != nil {
		log.Printf("Error %s when selecting the sum of results priority", err)
		return -1, err
	}

	return sum, nil
}
