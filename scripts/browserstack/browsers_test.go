package browserstack

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"testing"
)

func TestBrowsers(t *testing.T) {
	userName := os.Getenv("BROWSERSTACK_USERNAME")
	accessKey := os.Getenv("BROWSERSTACK_ACCESS_KEY")

	client := New(Config{
		UserName:  userName,
		AccessKey: accessKey,
	})

	browsers, err := client.Browsers(context.Background())
	if err != nil {
		t.Fatal(err)
	}

	b, err := json.Marshal(browsers)
	if err != nil {
		t.Fatal(err)
	}

	log.Println(string(b))

}

func TestBrowsers_WithoutAuth(t *testing.T) {
	userName := os.Getenv("BROWSERSTACK_USERNAME")
	accessKey := "b"

	client := New(Config{
		UserName:  userName,
		AccessKey: accessKey,
	})

	_, err := client.Browsers(context.Background())
	if err == nil || err.Error() != "Access denied" {
		t.Fatal("expected \"Access denied\" error")
	}
}
