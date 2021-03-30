import { Contract, ContractEvent, DefaultCheckpointers, Checkpointer, Wallet, Wallets } from "fabric-network";
import * as dotenv from "dotenv";
import { WalletHelper } from './WalletHelper'
import { AWSHelper } from './AWSHelper'
import { log } from './LogHelper'

dotenv.config();

class App {
    static main = async function() {
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


        const HSMLib: string = '/usr/lib/x86_64-linux-gnu/softhsm/libsofthsm2.so';
        const HSMPin: string = '1234';
        const HSMSlot: number = 0;
        const privateKeySKI: string = '10';

        const contract: Contract = await WalletHelper.GetContractWithConfig(walletPath, orgMSPId, walletIdentityLabel, certPathMSP, privateKeyPathMSP, certPathTLS, privateKeyPathTLS, connectionProfileFilePath, channelName, contractName);
        
        // Uncomment this line to use HSM
        // const contract: Contract = await WalletHelper.GetContractWithConfigHSM(walletPath, orgMSPId, walletIdentityLabel, certPathMSP, certPathTLS, privateKeyPathTLS, connectionProfileFilePath, channelName, contractName, HSMLib, HSMPin, HSMSlot, privateKeySKI);
        

        await this.callFunction(contract);

        // Uncomment this line to start event listener
        //await this.eventListener(contract);
    }


    static callFunction = async function(contract: Contract){
        const result = await contract.evaluateTransaction("QueryCouchDB", "{\"selector\":{}}")
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