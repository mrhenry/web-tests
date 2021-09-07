CREATE TABLE IF NOT EXISTS `polyfillio_hashes` (
	`polyfill_io_list` TEXT NOT NULL,
	`ua` TEXT NOT NULL,

	`hash` TEXT NOT NULL,

	PRIMARY KEY(
		`polyfill_io_list`,
		`ua`
	)

	UNIQUE(
		`polyfill_io_list`,
		`ua`
	) ON CONFLICT REPLACE
);
