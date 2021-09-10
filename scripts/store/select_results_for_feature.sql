SELECT `results`.`browser_version`, `results`.`browser`, `results`.`feature_id`, `results`.`os_version`, `results`.`os`, `results`.`test`, `results`.`hash`, `results`.`priority`, `results`.`score`
FROM `results`
WHERE `results`.`feature_id` = ?
