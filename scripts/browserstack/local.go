package browserstack

import (
	"archive/zip"
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

func getLocalBinary(parentCtx context.Context, accessKey string, localIdentifier string) (*exec.Cmd, error) {
	localBinPath := os.Getenv("BROWSERSTACK_LOCAL_BINARY_PATH")
	platform, arch := platformAndArch()

	if localBinPath == "" {
		localBinPath = "./BrowserStackLocal"
		if platform == "windows" {
			localBinPath += ".exe"
		}
	}

	if !fileExists(localBinPath) {
		err := downloadLocalBinary(parentCtx, localBinPath, platform, arch)
		if err != nil {
			return nil, err
		}
	}

	cmd := exec.CommandContext(
		parentCtx,
		localBinPath,
		accessKey,
		"-force",
		"-onlyAutomate",
		"--enable-logging-for-api",
		"--local-identifier",
		localIdentifier,
	)

	return cmd, nil
}

func downloadLocalBinary(parentCtx context.Context, localBinPath string, platform string, arch string) error {
	ctx, cancel := context.WithTimeout(parentCtx, time.Second*120)
	defer cancel()

	if platform == "darwin" {
		arch = "x64"
	}

	ext := ""
	if platform == "windows" {
		ext = "win32.zip"
	} else {
		ext = fmt.Sprintf("-%s-%s.zip", platform, arch)
	}

	url := fmt.Sprintf("https://www.browserstack.com/browserstack-local/BrowserStackLocal%s", ext)

	log.Printf("Downloading BrowserStackLocal from %s\n", url)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}

	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return errors.New(http.StatusText(resp.StatusCode))
	}

	b, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	r, err := zip.NewReader(bytes.NewReader(b), int64(len(b)))
	if err != nil {
		log.Fatal(err)
	}

	for _, f := range r.File {
		if !strings.HasPrefix(f.Name, "BrowserStackLocal") {
			continue
		}

		rc, err := f.Open()
		if err != nil {
			log.Fatal(err)
		}
		defer rc.Close()

		bf, err := os.Create(localBinPath)
		if err != nil {
			return err
		}

		defer bf.Close()

		_, err = io.Copy(bf, rc)
		if err != nil {
			return err
		}

		err = bf.Close()
		if err != nil {
			return err
		}

		err = os.Chmod(localBinPath, 0700)
		if err != nil {
			return err
		}

		return nil
	}

	return errors.New("no binary found")
}

func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}

func platformAndArch() (string, string) {
	platform := runtime.GOOS
	arch := runtime.GOARCH

	switch platform {
	case "darwin":
		switch arch {
		case "amd64":
			return "darwin", "x64"
		case "arm64":
			return "darwin", "arm64"
		}

		return "", ""

	case "freebsd":
		switch arch {
		case "amd64":
			return "freebsd", "x64"
		case "arm":
			return "freebsd", "arm"
		case "arm64":
			return "freebsd", "arm64"
		}

		return "", ""

	case "linux":
		switch arch {
		case "amd64":
			return "linux", "x64"
		case "arm":
			return "linux", "arm"
		case "arm64":
			return "linux", "arm64"
		case "mips":
			return "linux", "mips"
		case "ppc64":
			return "linux", "ppc64"
		case "s390x":
			return "linux", "s390x"
		}

		return "", ""

	case "netbsd":
		switch arch {
		case "amd64":
			return "netbsd", "x64"
		case "arm":
			return "netbsd", "arm"
		case "arm64":
			return "netbsd", "arm64"
		}

	case "openbsd":
		switch arch {
		case "amd64":
			return "openbsd", "x64"
		case "arm":
			return "openbsd", "arm"
		case "arm64":
			return "openbsd", "arm64"
		}

	case "windows":
		switch arch {
		case "amd64":
			return "windows", "x64"
		case "arm":
			return "windows", "arm"
		}

		return "", ""
	}

	return "", ""
}
