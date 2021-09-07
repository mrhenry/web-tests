package priority

type Fingerprint struct {
	FeatureID      string `json:"feature_id"`
	FeatureHash    string `json:"feature_hash"`
	BrowserKey     string `json:"browser_key"`
	PolyfillIOHash string `json:"polyfill.io_hash"`
}

type PolyfillIOHash struct {
	List []string `json:"list"`
	UA   string   `json:"ua"`
	Hash string   `json:"hash"`
}
