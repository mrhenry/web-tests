package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/url"
	"os"
	"strings"

	"github.com/romainmenke/web-tests/scripts/feature"
)

func main() {
	meta := feature.Feature{}

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

		err = f1.Close()
		if err != nil {
			log.Fatal(err)
		}

		{
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

		if (k == "babel" || k == "pure") && len(meta.PolyfillIO) > 0 {
			polyfills := url.QueryEscape(strings.Join(meta.PolyfillIO, ","))

			test := `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width" />
	<link rel="icon" href="data:;base64,iVBORw0KGgo=">
	<script src="https://polyfill.io/v3/polyfill.min.js?features=` + polyfills + `"></script>
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

			f2, err := os.Create(fmt.Sprintf("../../../../tests/%s:%s:%s:%s_polyfillio.html", meta.Spec.Org, meta.Spec.ID, meta.Spec.Section, k))
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
}
