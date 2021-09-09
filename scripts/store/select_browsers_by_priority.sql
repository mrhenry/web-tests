SELECT browser_version, browser, os_version, os FROM (
	SELECT * FROM (
		SELECT results.browser, results.browser_version, results.os, results.os_version, SUM(results.priority) as browser_priority
		FROM results
		JOIN user_agents ON 
			results.browser_version=user_agents.browser_version
			AND results.browser=user_agents.browser
			AND results.os_version=user_agents.os_version
			AND results.os=user_agents.os
			AND user_agents.browserstack = 1
		GROUP BY results.browser, results.browser_version, results.os, results.os_version
		ORDER BY browser_priority DESC
		LIMIT 45
	) WHERE browser_priority > 0
	UNION
	SELECT * FROM (
		SELECT results.browser, results.browser_version, results.os, results.os_version, SUM(results.priority) as browser_priority
		FROM results
		JOIN user_agents ON 
			results.browser_version=user_agents.browser_version
			AND results.browser=user_agents.browser
			AND results.os_version=user_agents.os_version
			AND results.os=user_agents.os
			AND user_agents.browserstack = 1
		GROUP BY results.browser, results.browser_version, results.os, results.os_version
		ORDER BY RANDOM()
		LIMIT 10
	)
)
ORDER BY browser_priority DESC
LIMIT 50
