UPDATE `features`
SET 
	`directory` = ?,
	`notes` = ?,
	`polyfill_io_list` = ?,
	`search_terms` = ?,
	`spec` = ?,
	`tests` = ?
WHERE `id` = ?;
