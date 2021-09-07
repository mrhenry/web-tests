INSERT OR IGNORE INTO `user_agents` (
	`browser_version`,
	`browser`,
	`os_version`,
	`os`,
	`ua`
) VALUES (
	?,
	?,
	?,
	?,
	?
);
