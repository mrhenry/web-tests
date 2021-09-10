CREATE TABLE IF NOT EXISTS `results` (
	`browser_version` TEXT NOT NULL,
	`browser` TEXT NOT NULL,
	`feature_id` TEXT NOT NULL,
	`os_version` TEXT NOT NULL,
	`os` TEXT NOT NULL,
	`test` TEXT NOT NULL,

	`hash` TEXT NOT NULL,
	`priority` NUMERIC NOT NULL,
	`score` NUMERIC NOT NULL,

	PRIMARY KEY(
		`browser_version`,
		`browser`,
		`feature_id`,
		`os_version`,
		`os`,
		`test`
	),
	FOREIGN KEY(`feature_id`) REFERENCES `features`(`id`)
);
