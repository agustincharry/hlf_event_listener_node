rm -r -f certs wallet

# TLS
kubectl cp fabric-tools:/data/crypto-config/peerOrganizations/Org0/users/Admin@Org0/tls/ca.crt certs/tls/ca.crt
kubectl cp fabric-tools:/data/crypto-config/peerOrganizations/Org0/users/Admin@Org0/tls/client.crt certs/tls/client.crt
kubectl cp fabric-tools:/data/crypto-config/peerOrganizations/Org0/users/Admin@Org0/tls/client.key certs/tls/client.key

# MSP
kubectl cp fabric-tools:/data/crypto-config/peerOrganizations/Org0/users/Admin@Org0/msp/signcerts/Admin@Org0-cert.pem certs/msp/Admin@Org0-cert.pem
kubectl cp fabric-tools:/data/crypto-config/peerOrganizations/Org0/users/Admin@Org0/msp/keystore/priv_sk certs/msp/priv_sk

# Orderer
kubectl cp fabric-tools:/data/crypto-config/ordererOrganizations/consortium/tlsca/tlsca.consortium-cert.pem certs/orderer/tlsca.consortium-cert.pem