module github.com/mrhenry/web-tests

go 1.16

require (
	github.com/blang/semver/v4 v4.0.0
	github.com/google/go-cmp v0.5.5 // indirect
	github.com/google/uuid v1.3.0
	github.com/hashicorp/go-version v1.6.0
	github.com/mattn/go-sqlite3 v1.14.15
	github.com/mileusna/useragent v1.2.0
	github.com/tebeka/selenium v0.9.9
	golang.org/x/sync v0.0.0-20220601150217-0de741cfad7f
)

replace github.com/tebeka/selenium v0.9.9 => github.com/romainmenke/selenium v0.9.14
