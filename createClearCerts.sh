# Init
rm -r -f clearCerts
mkdir -p clearCerts/{csr,ca,crt}
cd clearCerts
kubectl cp fabric-tools:/data/crypto-config/peerOrganizations/Org0/ca/ca.Org0-cert.pem ca/ca.Org0-cert.pem
kubectl cp fabric-tools:/data/crypto-config/peerOrganizations/Org0/ca/priv_sk ca/priv_sk
cp ca/ca.Org0-cert.pem ca/ca.pem


# Create a server private key.
openssl ecparam -out server.key -name prime256v1 -genkey -noout


# Generate the CSR using the private key.
openssl req -new -key server.key -out csr/serverClear.csr -subj "//C=US/ST=California/L=San Francisco/O=Org0/OU=client/OU=clear/CN=Clear@Org0"
openssl req -new -key server.key -out csr/serverReject.csr -subj "//C=US/ST=California/L=San Francisco/O=Org0/OU=client/OU=reject/CN=Reject@Org0"


# Generate the server certificate
openssl x509 -req -in csr/serverClear.csr -CA ca/ca.pem -CAkey ca/priv_sk -CAcreateserial -out crt/serverClear.crt -days 10000
openssl x509 -req -in csr/serverReject.csr -CA ca/ca.pem -CAkey ca/priv_sk -CAcreateserial -out crt/serverReject.crt -days 10000


# Copy certs to k8s
kubectl exec -it fabric-tools -- //bin/sh -c "cp -R /data/crypto-config/peerOrganizations/Org0/users/User1@Org0 /data/crypto-config/peerOrganizations/Org0/users/Clear@Org0"
kubectl cp crt/serverClear.crt fabric-tools:/data/crypto-config/peerOrganizations/Org0/users/Clear@Org0/msp/signcerts/serverClear.crt
kubectl cp server.key fabric-tools:/data/crypto-config/peerOrganizations/Org0/users/Clear@Org0/msp/keystore/server.key

kubectl exec -it fabric-tools -- //bin/sh -c "cp -R /data/crypto-config/peerOrganizations/Org0/users/User1@Org0 /data/crypto-config/peerOrganizations/Org0/users/Reject@Org0"
kubectl cp crt/serverReject.crt fabric-tools:/data/crypto-config/peerOrganizations/Org0/users/Reject@Org0/msp/signcerts/serverReject.crt
kubectl cp server.key fabric-tools:/data/crypto-config/peerOrganizations/Org0/users/Reject@Org0/msp/keystore/server.key


# Rename certs
kubectl exec -it fabric-tools -- //bin/sh -c "cp /data/crypto-config/peerOrganizations/Org0/users/Clear@Org0/msp/keystore/server.key /data/crypto-config/peerOrganizations/Org0/users/Clear@Org0/msp/keystore/priv_sk"
kubectl exec -it fabric-tools -- //bin/sh -c "cp /data/crypto-config/peerOrganizations/Org0/users/Clear@Org0/msp/signcerts/serverClear.crt /data/crypto-config/peerOrganizations/Org0/users/Clear@Org0/msp/signcerts/Clear@Org0-cert.pem"

kubectl exec -it fabric-tools -- //bin/sh -c "cp /data/crypto-config/peerOrganizations/Org0/users/Reject@Org0/msp/keystore/server.key /data/crypto-config/peerOrganizations/Org0/users/Reject@Org0/msp/keystore/priv_sk"
kubectl exec -it fabric-tools -- //bin/sh -c "cp /data/crypto-config/peerOrganizations/Org0/users/Reject@Org0/msp/signcerts/serverReject.crt /data/crypto-config/peerOrganizations/Org0/users/Reject@Org0/msp/signcerts/Reject@Org0-cert.pem"