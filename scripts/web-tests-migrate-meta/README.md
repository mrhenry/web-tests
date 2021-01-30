Update `FeaturePostMigration` in `web-tests-migrate-meta/main.go` with the fields you want to add.

```
make scripts
web-tests-migrate-meta
```

Update `web-tests-migrate-meta/main.go` to preserve your new fields on the next migration.
Update `Feature` in `feature/feature.go` with the newly added fields.
