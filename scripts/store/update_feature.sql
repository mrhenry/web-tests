UPDATE `features`
SET 
	`directory` = ?,
	`notes` = ?,
	`search_terms` = ?,
	`spec` = ?,
	`tests` = ?
WHERE `id` = ?;
