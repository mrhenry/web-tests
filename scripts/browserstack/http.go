package browserstack

import (
	"bytes"
	"context"
	"crypto/ecdsa"
	"crypto/ed25519"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/rsa"
	"crypto/tls"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"errors"
	"fmt"
	"math/big"
	"net"
	"net/http"
	"strings"
	"time"
)

func newTestServer(ctx context.Context, handler http.Handler) (int, error) {
	listener, err := net.Listen("tcp", ":0")
	if err != nil {
		return 0, err
	}

	srv := &http.Server{
		Handler: handler,
	}

	go func() {
		select {
		case <-ctx.Done():
			time.Sleep(time.Second * 5)

			srv.Close()
		}
	}()

	go func() {
		srv.Serve(listener)
	}()

	return listener.Addr().(*net.TCPAddr).Port, nil
}

func newHTTPSTestServer(ctx context.Context, handler http.Handler) (int, error) {
	pub, priv, err := generateKeys(generateOptions{
		Host:       "bs-local.com",
		RSABits:    512,
		ECDSACurve: "P256",
	})
	if err != nil {
		return 0, err
	}

	cert, err := tls.X509KeyPair(pub, priv)
	if err != nil {
		return 0, err
	}

	listener, err := net.Listen("tcp", ":0")
	if err != nil {
		return 0, err
	}

	srv := &http.Server{
		Handler:   handler,
		TLSConfig: &tls.Config{Certificates: []tls.Certificate{cert}},
	}

	go func() {
		select {
		case <-ctx.Done():
			time.Sleep(time.Second * 5)

			srv.Close()
		}
	}()

	go func() {
		srv.ServeTLS(listener, "", "")
	}()

	return listener.Addr().(*net.TCPAddr).Port, nil
}

func publicKey(priv interface{}) interface{} {
	switch k := priv.(type) {
	case *rsa.PrivateKey:
		return &k.PublicKey
	case *ecdsa.PrivateKey:
		return &k.PublicKey
	case ed25519.PrivateKey:
		return k.Public().(ed25519.PublicKey)
	default:
		return nil
	}
}

// GenerateOptions is used to configure the keys.
type generateOptions struct {

	// Comma-separated hostnames and IPs to generate a certificate for.
	Host string

	// Creation date formatted as "Jan 1 15:04:05 2011".
	// Default is time.Now().
	ValidFrom string

	// Duration that certificate is valid for.
	// Default is 365*24*time.Hour.
	ValidFor time.Duration

	// Whether this cert should be its own Certificate Authority
	// Default is false.
	IsCA bool

	// Size of RSA key to generate. Ignored if ECDSACurve is set
	// Default is 2048.
	RSABits int

	// ECDSA curve to use to generate a key. Valid values are P224, P256 (recommended), P384, P521
	// Default is "".
	ECDSACurve string

	// Generate an Ed25519 key
	// Default is false.
	ED25519Key bool
}

// GenerateKeys will return the public and private keys.
//
// See https://github.com/denji/golang-tls and https://stackoverflow.com/questions/47857573/passing-certificate-and-key-as-string-to-listenandservetls/47857805
func generateKeys(opts generateOptions) ([]byte, []byte, error) {

	// Validate Options
	if opts.Host == "" {
		return nil, nil, errors.New("missing required Host parameter")
	}

	if opts.ValidFor == 0 {
		opts.ValidFor = 365 * 24 * time.Hour
	}

	if opts.RSABits == 0 {
		opts.RSABits = 2048
	}

	var priv interface{}
	var err error
	switch opts.ECDSACurve {
	case "":
		if opts.ED25519Key {
			_, priv, err = ed25519.GenerateKey(rand.Reader)
		} else {
			priv, err = rsa.GenerateKey(rand.Reader, opts.RSABits)
		}
	case "P224":
		priv, err = ecdsa.GenerateKey(elliptic.P224(), rand.Reader)
	case "P256":
		priv, err = ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	case "P384":
		priv, err = ecdsa.GenerateKey(elliptic.P384(), rand.Reader)
	case "P521":
		priv, err = ecdsa.GenerateKey(elliptic.P521(), rand.Reader)
	default:
		return nil, nil, fmt.Errorf("unrecognized elliptic curve: %q", opts.ECDSACurve)
	}
	if err != nil {
		return nil, nil, fmt.Errorf("failed to generate private key: %w", err)
	}

	var notBefore time.Time
	if len(opts.ValidFrom) == 0 {
		notBefore = time.Now()
	} else {
		notBefore, err = time.Parse("Jan 2 15:04:05 2006", opts.ValidFrom)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to parse creation date: %w", err)
		}
	}

	notAfter := notBefore.Add(opts.ValidFor)

	serialNumberLimit := new(big.Int).Lsh(big.NewInt(1), 128)
	serialNumber, err := rand.Int(rand.Reader, serialNumberLimit)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to generate serial number: %w", err)
	}

	template := x509.Certificate{
		SerialNumber: serialNumber,
		Subject: pkix.Name{
			Organization: []string{"Acme Co"},
		},
		NotBefore: notBefore,
		NotAfter:  notAfter,

		KeyUsage:              x509.KeyUsageKeyEncipherment | x509.KeyUsageDigitalSignature,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
	}

	hosts := strings.Split(opts.Host, ",")
	for _, h := range hosts {
		if ip := net.ParseIP(h); ip != nil {
			template.IPAddresses = append(template.IPAddresses, ip)
		} else {
			template.DNSNames = append(template.DNSNames, h)
		}
	}

	if opts.IsCA {
		template.IsCA = true
		template.KeyUsage |= x509.KeyUsageCertSign
	}

	derBytes, err := x509.CreateCertificate(rand.Reader, &template, &template, publicKey(priv), priv)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create certificate: %w", err)
	}

	// Create public key
	pubBuf := new(bytes.Buffer)
	err = pem.Encode(pubBuf, &pem.Block{Type: "CERTIFICATE", Bytes: derBytes})
	if err != nil {
		return nil, nil, fmt.Errorf("failed to write data to cert.pem: %w", err)
	}

	// Create private key
	privBuf := new(bytes.Buffer)
	privBytes, err := x509.MarshalPKCS8PrivateKey(priv)
	if err != nil {
		return nil, nil, fmt.Errorf("unable to marshal private key: %w", err)
	}

	err = pem.Encode(privBuf, &pem.Block{Type: "PRIVATE KEY", Bytes: privBytes})
	if err != nil {
		return nil, nil, fmt.Errorf("failed to write data to key.pem: %w", err)
	}

	return pubBuf.Bytes(), privBuf.Bytes(), nil
}
