import { Contract, ContractEvent, DefaultCheckpointers, Checkpointer } from "fabric-network";
import * as dotenv from "dotenv";
import { WalletHelper } from './WalletHelper'
import { AWSHelper } from './AWSHelper'
import { log } from './LogHelper'

dotenv.config();

class App {
    static main = async function() {
        /*
        const id = 'nu0094001-blockchain-dev-PeerCouchDBSecrets';
        //const id = 'nu0094001-blockchain-dev-ECDSA-Key-peer-2';
        const data = await AWSHelper.getAWSSecret(id);
        log.info(data.SecretString)
        */

        /*
        const ARNCA = 'arn:aws:acm-pca:us-east-1:872308410481:certificate-authority/ee2eadae-1a4e-4034-9f22-cc2626854c20'
        const ARNCert = 'arn:aws:acm-pca:us-east-1:872308410481:certificate-authority/ee2eadae-1a4e-4034-9f22-cc2626854c20/certificate/24b8806b62a3add92ba7befe34cdd321';
        const data2 = await AWSHelper.getCertByARN(ARNCert, ARNCA);
        log.info(data2)*/

        
        const walletPath: string = 'wallet';
        const walletIdentityLabel: string = 'TheWallet';
        const certPathMSP: string = 'certs/msp/Admin@Org0-cert.pem';
        const privateKeyPathMSP: string = 'certs/msp/priv_sk';
        const certPathTLS: string = 'certs/tls/client.crt'
        const privateKeyPathTLS: string ='certs/tls/client.key'

        const env = process.env.ENV;
        const orgMSPId: string = process.env.ORG_MSP_ID;
        const connectionProfileFilePath: string = 'network/connection-profile-' + env + '.yaml';
        const channelName = process.env.CHANNEL_NAME;
        const contractName = process.env.CONTRACT_NAME;

        const contract: Contract = await WalletHelper.GetContractWithConfig(walletPath, orgMSPId, walletIdentityLabel, certPathMSP, privateKeyPathMSP, certPathTLS, privateKeyPathTLS, connectionProfileFilePath, channelName, contractName);
        await this.eventListener(contract);
    }


    static callFunction = async function(contract: Contract){
        const result=await contract.evaluateTransaction("QueryCouchDB", "{\"selector\":{}}")
        log.info('Transaction has been submitted');
        log.info(result.toString());
        log.info('--------------------------------');
    }

    static eventListener = async function(contract: Contract){
        const listener = async (event: ContractEvent) => {
            const payload = event.payload.toString('utf8');
            log.info("Event: " + event.eventName + ". Payload: " + payload);
        };

        log.info("Event listener started...")

        const checkpointer: Checkpointer = await DefaultCheckpointers.file('checkPointer');
        await contract.addContractListener(listener, {checkpointer});
    }
}


App.main();