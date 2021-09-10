SELECT feature_id, test FROM (
	SELECT * FROM (
		SELECT results.feature_id, results.test, results.priority
		FROM results
		WHERE results.browser = ? AND results.browser_version = ? AND results.os = ? AND results.os_version = ? AND results.priority > 0
		ORDER BY results.priority DESC
		LIMIT 20
	)
	UNION
	SELECT * FROM (
		SELECT results.feature_id, results.test, results.priority
		FROM results
		JOIN user_agents ON
			results.browser_version=user_agents.browser_version
			AND results.browser=user_agents.browser
			AND results.os_version=user_agents.os_version
			AND results.os=user_agents.os
			AND user_agents.browserstack = 1
		ORDER BY RANDOM()
		LIMIT 10
	)
)
ORDER BY priority DESC
LIMIT 25
