# Hyperledger Fabric Event Listener Application

## Introduction
This proof of concept contains:

* Connection to the BlockChain Backend using a Wallet to store credentials.
    * One function which will populate the wallet with the public certificate and the private key.
    * One function which will populate the wallet with the public certificate and and connect to a HSM to get the handler of a private key.
* Implementation of an event listener which logs the events received.
* Event listener with a checkpointer which register the last event processed.
* Example of function to call a chaincode function.


## Configuration

1. Create the next folder structure:
###
    .                                   # Root folder project
    ├── certs                           # Folder to store certificates
    │   ├── msp                         # MSP certificate folder
    │   │   ├── Admin@Org0-cert.pem     # Public MSP certificate.
    │   │   └── priv_sk                 # Private MSP Key. ONLY NEEDED IF HSM IS NOT IMPLEMENTED.
    │   └── tls                         # TLS certificate folder
    │       ├── ca.crt                  # Public TLS CA certificate.
    │       ├── client.crt              # Public TLS certificate.
    │       └── client.key              # Private TLS Key.
    ├── .env                            # File to set the environment variables.
    └── ...

2. Set the environment variables in the .env file.
```
ENV=local
CHANNEL_NAME=mychannel
CONTRACT_NAME=basic
ORG_MSP_ID=Org0
```

3. Change the peers IP in the network/connection-profile-local.yaml

4. If you want to use HSM, you need to follow the steps described in ```softHSM/Readme.md```

5. If you are using the next test network
```
https://github.com/agustincharry/hlf_k8s_cryptogen
``` 
You can run the ``` getEventListenerCerts.sh ``` script to populate the needed certificates.

## Run the application

* ```npm run dev``` To execute the app.
* ```npm run build``` To build the app, generate the .js files.