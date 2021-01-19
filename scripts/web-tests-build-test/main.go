package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
)

func main() {
	meta := feature{}

	{
		f, err := os.Open("./meta.json")
		if err != nil {
			log.Fatal(err)
		}

		defer f.Close()

		b, err := ioutil.ReadAll(f)
		if err != nil {
			log.Fatal(err)
		}

		err = json.Unmarshal(b, &meta)
		if err != nil {
			log.Fatal(err)
		}
	}

	for k, v := range meta.Tests {
		f1, err := os.Open(v)
		if err != nil {
			log.Fatal(err)
		}

		defer f1.Close()

		b, err := ioutil.ReadAll(f1)
		if err != nil {
			log.Fatal(err)
		}

		test := `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width" />
	<link rel="icon" href="data:;base64,iVBORw0KGgo=">
</head>
<body>
	<script>
		function callback(success) {
			window.testSuccess = success;
		}
		
		;` + string(b) + `;
	</script>
</body>
</html>
`

		f2, err := os.Create(fmt.Sprintf("../../../../tests/%s:%s:%s:%s.html", meta.Spec.Org, meta.Spec.ID, meta.Spec.Section, k))
		if err != nil {
			log.Fatal(err)
		}

		defer f2.Close()

		_, err = f2.WriteString(test)
		if err != nil {
			log.Fatal(err)
		}

		err = f2.Close()
		if err != nil {
			log.Fatal(err)
		}
	}
}

type feature struct {
	Spec struct {
		Org     string `json:"org"`
		ID      string `json:"id"`
		Section string `json:"section"`
	} `json:"spec"`
	Tests map[string]string `json:"tests"`
	Dir   string            `json:"dir"`
}
