package browserua

type BrowserUAs struct {
	Key     string   `json:"key"`
	UAs     []string `json:"uas"`
	SecCHUA bool     `json:"sec-ch-ua"`
}
