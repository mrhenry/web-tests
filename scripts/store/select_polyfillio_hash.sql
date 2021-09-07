SELECT `hash`
FROM `polyfillio_hashes`
WHERE (
	1=1
	AND `polyfill_io_list` = ?
	AND `ua` = ?
);
