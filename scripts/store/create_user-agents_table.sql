CREATE TABLE IF NOT EXISTS `user_agents` (
	`browser_version` TEXT NOT NULL,
	`browser` TEXT NOT NULL,
	`os_version` TEXT NOT NULL,
	`os` TEXT NOT NULL,
	`ua` TEXT NOT NULL,

	PRIMARY KEY(`ua`)
);
