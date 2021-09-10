UPDATE `results`
SET 
	`hash` = ?,
	`priority` = ?,
	`score` = ?
WHERE (
	1=1
	AND `browser_version` = ?
	AND `browser` = ?
	AND `feature_id` = ?
	AND `os_version` = ?
	AND `os` = ?
	AND `test` = ?
);
