UPDATE `features`
SET 
	`directory` = ?,
	`notes` = ?,
	`polyfill_io` = ?,
	`search_terms` = ?,
	`spec` = ?
WHERE `id` = ?;
