module github.com/mrhenry/web-tests

go 1.23.0

require (
	github.com/blang/semver/v4 v4.0.0
	github.com/google/uuid v1.6.0
	github.com/hashicorp/go-version v1.7.0
	github.com/mattn/go-sqlite3 v1.14.28
	github.com/mileusna/useragent v1.3.5
	github.com/tebeka/selenium v0.9.9
	golang.org/x/sync v0.16.0
)

require github.com/blang/semver v3.5.1+incompatible // indirect

replace github.com/tebeka/selenium v0.9.9 => github.com/romainmenke/selenium v0.9.15
