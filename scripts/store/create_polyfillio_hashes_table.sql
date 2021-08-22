CREATE TABLE IF NOT EXISTS `polyfillio_hashes` (
	`feature_id` TEXT NOT NULL,
	`ua` TEXT NOT NULL,

	`hash` TEXT NOT NULL,

	PRIMARY KEY(`feature_id`,`ua`)
);
