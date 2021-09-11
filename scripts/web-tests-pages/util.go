package main

import (
	"fmt"

	"github.com/mrhenry/web-tests/scripts/result"
)

func resultKey(x result.Result) string {
	if x.OS != "" {
		return fmt.Sprintf("%s/%s", x.OS, x.BrowserVersion)
	}

	return fmt.Sprintf("%s/%s", x.Browser, x.BrowserVersion)
}

type Scores map[string][]float64

func (x Scores) sum(y Scores) {
	c := Scores{}
	for k, v := range y {
		c[k] = v
	}

	{
		_, hasPurePolyfillIOResult := c["pure_polyfillio"]
		pureResult, hasPureResult := c["pure"]
		if !hasPurePolyfillIOResult && hasPureResult {
			c["pure_polyfillio"] = pureResult
		}
	}

	{
		_, hasBabelPolyfillIOResult := c["babel_polyfillio"]
		babelResult, hasBabelResult := c["babel"]
		if !hasBabelPolyfillIOResult && hasBabelResult {
			c["babel_polyfillio"] = babelResult
		}
	}

	for ck, cv := range c {
		if xv, ok := x[ck]; ok {
			x[ck] = append(xv, cv...)
		} else {
			x[ck] = cv
		}
	}
}

func (x Scores) addScore(test string, score float64) {
	if y, ok := x[test]; ok {
		x[test] = append(y, score)
	} else {
		x[test] = []float64{score}
	}
}

func (x Scores) table(order []string) string {
	avgScores := map[string]float64{}

	for k, v := range x {
		avgScores[k] = 0

		for _, vv := range v {
			avgScores[k] += vv
		}

		avgScores[k] = avgScores[k] / float64(len(v))
	}

	tableContents := ""

	for _, test := range order {
		v, ok := avgScores[test]
		if !ok {
			continue
		}

		tableContents = tableContents + `<tr><td>` + test + `</td><td>` + fmt.Sprintf("%sN", numberOfNines(v)) + `</tr>` + "\n"
	}

	return `<table><tbody>` + tableContents + `</tbody></table>` + "\n"
}

func (x Scores) tableIfFailing(order []string) string {
	avgScores := map[string]float64{}

	for k, v := range x {
		avgScores[k] = 0

		for _, vv := range v {
			avgScores[k] += vv
		}

		avgScores[k] = avgScores[k] / float64(len(v))
	}

	tableContents := ""

	hasFailing := false
	for _, test := range order {
		v, ok := avgScores[test]
		if !ok {
			continue
		}

		if v < 0.99999 {
			hasFailing = true
		}

		tableContents = tableContents + `<tr><td>` + test + `</td><td>` + fmt.Sprintf("%sN", numberOfNines(v)) + `</tr>` + "\n"
	}

	if !hasFailing {
		return ""
	}

	return `<table><tbody>` + tableContents + `</tbody></table>` + "\n"
}

type Points map[string]int

func (x Points) sum(y Scores) {
	avgScores := map[string]float64{}

	for k, v := range y {
		avgScores[k] = 0

		for _, vv := range v {
			avgScores[k] += vv
		}

		avgScores[k] = avgScores[k] / float64(len(v))
	}

	{
		_, hasPurePolyfillIOResult := avgScores["pure_polyfillio"]
		pureResult, hasPureResult := avgScores["pure"]
		if !hasPurePolyfillIOResult && hasPureResult {
			avgScores["pure_polyfillio"] = pureResult
		}
	}

	{
		_, hasBabelPolyfillIOResult := avgScores["babel_polyfillio"]
		babelResult, hasBabelResult := avgScores["babel"]
		if !hasBabelPolyfillIOResult && hasBabelResult {
			avgScores["babel_polyfillio"] = babelResult
		}
	}

	for ck, score := range avgScores {
		if score >= 0.99999 {
			x[ck] = x[ck] + 1
		}
	}
}

func (x Points) table(order []string, featuresTested int) string {
	tableContents := ""

	for _, test := range order {
		v, ok := x[test]
		if !ok {
			continue
		}

		tableContents = tableContents + `<tr><td>` + test + `</td><td>` + fmt.Sprintf("%d", v) + ` / ` + fmt.Sprintf("%d", featuresTested) + `</tr>` + "\n"
	}

	return `<table><tbody>` + tableContents + `</tbody></table>` + "\n"
}

func scoreToInt(v float64) int {
	if v >= 0.9 {
		return 1
	}

	return 0
}

func numberOfNines(v float64) string {
	if v >= 0.9999999999 {
		return "∞"
	}
	if v >= 0.999999999 {
		return "9"
	}

	if v >= 0.99999999 {
		return "8"
	}

	if v >= 0.9999999 {
		return "7"
	}

	if v >= 0.999999 {
		return "6"
	}

	if v >= 0.99999 {
		return "5"
	}

	if v >= 0.9999 {
		return "4"
	}

	if v >= 0.999 {
		return "3"
	}

	if v >= 0.99 {
		return "2"
	}

	if v >= 0.9 {
		return "1"
	}

	return "0"
}
