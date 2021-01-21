package feature

type Feature struct {
	Spec struct {
		Org     string `json:"org"`
		ID      string `json:"id"`
		Section string `json:"section"`
		Name    string `json:"name"`
		URL     string `json:"url"`
	} `json:"spec"`
	Tests      map[string]string `json:"tests"`
	PolyfillIO []string          `json:"polyfill.io"`
}

type FeatureWithDir struct {
	Feature
	Dir string `json:"dir"`
}
