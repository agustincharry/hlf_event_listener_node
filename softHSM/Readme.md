# Steps to use SoftHSM

1. Initialize the token.
```
softhsm2-util --init-token --slot 0 --label "Token-1" --so-pin 1234 --pin 1234
```
2. Generate a Elliptic Curve private key.
```
pkcs11-tool --module /usr/lib/x86_64-linux-gnu/softhsm/libsofthsm2.so --pin 1234 -k --id 10 --label "10" --key-type EC:prime256v1
```
3. Generate a .CSR file using the private key stored in HSM.
```
docker run -v /var/lib/softhsm/tokens/:/var/lib/softhsm/tokens/ agustincharry/hsm-csr-generator:1.0
```
4. Save the .CSR into a file server.csr

5. Generate certificate from the .CSR with CA credentials
```
openssl x509 -req -in server.csr -CA ca.pem -CAkey priv_sk -CAcreateserial -out server.crt -days 10000
```
6. Replace the contents of the file ```certs/msp/Admin@Org0-cert.pem``` with the new certificate.