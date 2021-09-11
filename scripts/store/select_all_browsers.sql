SELECT browser_version, browser, os_version, os, ua, browserstack
FROM user_agents
WHERE browserstack = 1
GROUP BY user_agents.browser, user_agents.browser_version, user_agents.os, user_agents.os_version
