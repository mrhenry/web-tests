package main

import (
	"context"
	"log"

	"github.com/mrhenry/web-tests/scripts/store"
)

func main() {
	db, err := store.NewSqliteDatabase("./web-tests.db", false)
	if err != nil {
		log.Fatal(err)
	}
	defer store.CloseDB(db)

	err = store.ResetResultPriority(context.Background(), db)
	if err != nil {
		log.Fatal(err)
	}
}
