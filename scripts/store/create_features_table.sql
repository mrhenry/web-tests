CREATE TABLE IF NOT EXISTS `features` (
	`id` TEXT NOT NULL UNIQUE,
	
	`directory` TEXT NOT NULL,
	`notes` TEXT NOT NULL,
	`polyfill_io_list` TEXT NOT NULL,
	`search_terms` TEXT NOT NULL,
	`spec` TEXT NOT NULL,

	PRIMARY KEY(
		`id`
	)
);
