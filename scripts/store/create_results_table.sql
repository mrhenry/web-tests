CREATE TABLE `results` (
	`browser_version` TEXT NOT NULL,
	`browser` TEXT NOT NULL,
	`feature_id` TEXT NOT NULL,
	`os_version` TEXT NOT NULL,
	`os` TEXT NOT NULL,
	`test` TEXT NOT NULL,

	`hash` TEXT NOT NULL,
	`priority` NUMERIC NOT NULL,
	`score` NUMERIC NOT NULL,
	PRIMARY KEY(`feature_id`,`test`,`browser`,`browser_version`,`os`,`os_version`),
	FOREIGN KEY(`feature_id`) REFERENCES `features`(`id`)
);
