package browserstack

import (
	"context"
	"log"
	"os"
	"testing"
)

func TestNewWorker(t *testing.T) {
	userName := os.Getenv("BROWSERSTACK_USERNAME")
	accessKey := os.Getenv("BROWSERSTACK_ACCESS_KEY")

	if userName == "" {
		return
	}

	client := New(Config{
		UserName:  userName,
		AccessKey: accessKey,
	})

	worker, err := client.NewWorker(context.Background(), WorkerConfig{
		OS:             "Windows",
		OSVersion:      "10",
		Browser:        "chrome",
		BrowserVersion: "84",
		URL:            "https://core-web.mrhenry.studio/e2e/",
	})
	if err != nil {
		t.Fatal(err)
	}

	log.Println(worker)

	defer worker.Close()
}

func TestWorkers(t *testing.T) {
	userName := os.Getenv("BROWSERSTACK_USERNAME")
	accessKey := os.Getenv("BROWSERSTACK_ACCESS_KEY")

	if userName == "" {
		return
	}

	client := New(Config{
		UserName:  userName,
		AccessKey: accessKey,
	})

	workers, err := client.Workers(context.Background())
	if err != nil {
		t.Fatal(err)
	}

	log.Println(workers)

	for _, worker := range workers {
		worker.Close()
	}
}

func TestWorkers_WithoutAuth(t *testing.T) {
	userName := os.Getenv("BROWSERSTACK_USERNAME")
	accessKey := "b"

	if userName == "" {
		return
	}

	client := New(Config{
		UserName:  userName,
		AccessKey: accessKey,
	})

	_, err := client.Workers(context.Background())
	if err == nil || err.Error() != "Access denied" {
		t.Fatal("expected \"Access denied\" error")
	}
}
