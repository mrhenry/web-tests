SELECT browser_version, browser, os_version, os
FROM user_agents
WHERE (browser = ? OR os = ?) AND browserstack = 1
GROUP BY browser, browser_version, os, os_version
ORDER BY RANDOM()
LIMIT 50
