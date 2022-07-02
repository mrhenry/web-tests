package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/url"
	"os"
	"strings"

	"github.com/mrhenry/web-tests/scripts/feature"
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
		if v.ModuleScript != "" && v.NoModulesScript != "" {
			{
				f1, err := os.Open(v.ModuleScript)
				if err != nil {
					log.Fatal(err)
				}

				defer f1.Close()

				f2, err := os.Create(fmt.Sprintf("../../../../test-assets/%s:%s", meta.ID, strings.TrimPrefix(v.ModuleScript, "test.")))
				if err != nil {
					log.Fatal(err)
				}

				defer f2.Close()

				_, err = io.Copy(f2, f1)
				if err != nil {
					log.Fatal(err)
				}

				err = f1.Close()
				if err != nil {
					log.Fatal(err)
				}

				err = f2.Close()
				if err != nil {
					log.Fatal(err)
				}
			}

			{
				f1, err := os.Open(v.NoModulesScript)
				if err != nil {
					log.Fatal(err)
				}

				defer f1.Close()

				f2, err := os.Create(fmt.Sprintf("../../../../test-assets/%s:%s", meta.ID, strings.TrimPrefix(v.NoModulesScript, "test.")))
				if err != nil {
					log.Fatal(err)
				}

				defer f2.Close()

				_, err = io.Copy(f2, f1)
				if err != nil {
					log.Fatal(err)
				}

				err = f1.Close()
				if err != nil {
					log.Fatal(err)
				}

				err = f2.Close()
				if err != nil {
					log.Fatal(err)
				}
			}

			test := `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width" />
	<link rel="icon" href="data:;base64,iVBORw0KGgo=">
	<script type="text/javascript">
		if ('customElements' in window) {
			customElements.forcePolyfill = true;
		}
	</script>
	
	` + errorHandlers + `
	<script nomodule>
		(function() {
			try {
				var check = document.createElement('script');
				if (!('noModule' in check) && 'onbeforeload' in check) {
					var support = false;
					document.addEventListener('beforeload', function(e) {
						if (e.target === check) {
							support = true;
						} else if (!e.target.hasAttribute('nomodule') || !support) {
							return;
						}
						e.preventDefault();
					}, true);

					check.type = 'module';
					check.src = '.';
					document.head.appendChild(check);
					check.remove();
				}
			} catch ( _ ) {

			}
		}());
	</script>
</head>
<body>
	` + fixtures + `
	<script>
		var callback = function callback(success) {
			if ('testSuccess' in window) {
				return;
			}
			
			window.testSuccess = success;
		}

		window.callback = callback;
	</script>
	<script>
		window.testLoaded = true;
	</script>
	<script type="module" src="` + fmt.Sprintf("../test-assets/%s:%s", meta.ID, strings.TrimPrefix(v.ModuleScript, "test.")) + `"></script>
	<script nomodule src="` + fmt.Sprintf("../test-assets/%s:%s", meta.ID, strings.TrimPrefix(v.NoModulesScript, "test.")) + `"></script>
</body>
</html>
`

			f3, err := os.Create(fmt.Sprintf("../../../../tests/%s:%s.html", meta.ID, k))
			if err != nil {
				log.Fatal(err)
			}

			defer f3.Close()

			_, err = f3.WriteString(test)
			if err != nil {
				log.Fatal(err)
			}

			err = f3.Close()
			if err != nil {
				log.Fatal(err)
			}

			continue
		}

		inlineCSSBytes := []byte{}
		if v.InlineCSS != "" {
			inlineCSSFile, err := os.Open(v.InlineCSS)
			if err != nil {
				log.Fatal(err)
			}

			defer inlineCSSFile.Close()

			inlineCSSBytes, err = ioutil.ReadAll(inlineCSSFile)
			if err != nil {
				log.Fatal(err)
			}

			err = inlineCSSFile.Close()
			if err != nil {
				log.Fatal(err)
			}
		}

		inlineHTMLBytes := []byte{}
		if v.InlineHTML != "" {
			inlineHTMLFile, err := os.Open(v.InlineHTML)
			if err != nil {
				log.Fatal(err)
			}

			defer inlineHTMLFile.Close()

			inlineHTMLBytes, err = ioutil.ReadAll(inlineHTMLFile)
			if err != nil {
				log.Fatal(err)
			}

			err = inlineHTMLFile.Close()
			if err != nil {
				log.Fatal(err)
			}
		}

		inlineScriptBytes := []byte{}
		if v.InlineScript != "" {
			inlineScriptFile, err := os.Open(v.InlineScript)
			if err != nil {
				log.Fatal(err)
			}

			defer inlineScriptFile.Close()

			inlineScriptBytes, err = ioutil.ReadAll(inlineScriptFile)
			if err != nil {
				log.Fatal(err)
			}

			err = inlineScriptFile.Close()
			if err != nil {
				log.Fatal(err)
			}
		}

		polyfillIOScriptTag := ""
		if v.HasPolyfillIO && len(meta.PolyfillIO) > 0 {
			polyfills := url.QueryEscape(strings.Join(meta.PolyfillIO, ","))
			polyfillIOScriptTag = `<script src="https://polyfill.io/v3/polyfill.min.js?features=` + polyfills + `"></script>`
		}

		{
			test := `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width" />
	<link rel="icon" href="data:;base64,iVBORw0KGgo=">
	<script type="text/javascript">
		if ('customElements' in window) {
			customElements.forcePolyfill = true;
		}
	</script>

	` + errorHandlers + `

	` + polyfillIOScriptTag + `
</head>
<body>

	` + fixtures + `

	<style>` + string(inlineCSSBytes) + `</style>

	` + string(inlineHTMLBytes) + `

	<script>

		function callback(success) {
			if ('testSuccess' in window) {
				return;
			}

			window.testSuccess = success;
		}
		
		;` + string(inlineScriptBytes) + `;
	</script>
	<script>
		window.testLoaded = true;
	</script>
</body>
</html>
`

			f2, err := os.Create(fmt.Sprintf("../../../../tests/%s:%s.html", meta.ID, k))
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

const fixtures = `
<style>
	html,
	body {
		margin: 0;
		padding: 0;
	}
</style>
<div id="the-fixture"></div>
<div class="a-fixture"></div>
<div style="position: relative; width: 100%; height: 100px;">
	<div id="the-fixture--positioned" style="position: absolute; width: 50px; height: 50px; left: 25px; top: 25px; background-color: blue;">
	</div>
</div>
`

const errorHandlers = `
<script>
	window.onerror = function() {
		if ('testSuccess' in window) {
			return;
		}
		
		window.testSuccess = false;
	};

	window.onunhandledrejection = function() {
		if ('testSuccess' in window) {
			return;
		}
		
		window.testSuccess = false;
	};
</script>
`
