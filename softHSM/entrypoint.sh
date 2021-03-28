export SLOT=$(softhsm2-util --show-slots | grep Slot | head -n 1 | cut -d ' ' -f 2)
OPENSSL_CONF=openssl.cnf openssl req -engine pkcs11 -keyform engine -new -key $SLOT:$KEY_ID -out server.csr -subj "/C=US/ST=California/L=San Francisco/O=Org0/OU=client/CN=Org0@Org0"
cat server.csr