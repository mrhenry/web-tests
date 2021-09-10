SELECT `ua`, `browserstack`
FROM `user_agents`
WHERE (
	1=1
	AND `browser_version` = ?
	AND `browser` = ?
	AND `os_version` = ?
	AND `os` = ?
);
