SELECT COUNT(*)
FROM `results`
WHERE (
	1=1
	AND `browser_version` = ?
	AND `browser` = ?
	AND `feature_id` = ?
	AND `os_version` = ?
	AND `os` = ?
	AND `test` = ?
)
LIMIT 1;
