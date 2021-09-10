SELECT `results`.`browser_version`, `results`.`browser`, `results`.`feature_id`, `results`.`os_version`, `results`.`os`, `results`.`test`, `results`.`hash`, `results`.`priority`, `results`.`score`
FROM `results`
JOIN `user_agents` ON 
	`results`.`browser_version`=`user_agents`.`browser_version`
	AND `results`.`browser`=`user_agents`.`browser`
	AND `results`.`os_version`=`user_agents`.`os_version`
	AND `results`.`os`=`user_agents`.`os`
	AND `user_agents`.`ua` = ?
