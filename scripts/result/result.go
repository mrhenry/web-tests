package result

type Result struct {
	Browser        string `json:"browser"`
	BrowserVersion string `json:"browser_version"`
	FeatureID      string `json:"feature_id"`
	OS             string `json:"os"`
	OSVersion      string `json:"os_version"`
	Test           string `json:"test"`

	Hash     string  `json:"hash"`
	Priority int     `json:"priority"`
	Score    float64 `json:"score"`
}
