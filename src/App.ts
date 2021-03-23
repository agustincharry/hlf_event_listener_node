import { Contract, ContractEvent, ContractListener, DefaultCheckpointers, Checkpointer } from "fabric-network";
import * as dotenv from "dotenv";
import { WalletHelper } from './WalletHelper'
import { AWSHelper } from './AWSHelper'
dotenv.config();

class App {
    main = async function() {   
        const data = await AWSHelper.getAWSSecret('nu0094001-blockchain-dev-PeerCouchDBSecrets');
        console.log(data)
        
        const walletPath: string = 'wallet';
        const orgMSPId: string = 'Org0';
        const walletIdentityLabel: string = 'Agus';
        const certPathMSP: string = 'certs/msp/Admin@Org0-cert.pem';
        const privateKeyPathMSP: string = 'certs/msp/priv_sk';
        const certPathTLS: string = 'certs/tls/client.crt'
        const privateKeyPathTLS: string ='certs/tls/client.key'
        const connectionProfileFilePath: string = 'network/connection-dev.yaml';
        const channelName = 'mychannel';
        const contractName = 'basic';
        
        
        const contract: Contract = await WalletHelper.GetContractWithConfig(walletPath, orgMSPId, walletIdentityLabel, certPathMSP, privateKeyPathMSP, certPathTLS, privateKeyPathTLS, connectionProfileFilePath, channelName, contractName)

        //await this.callFunction(contract);

        await this.eventListener(contract);             
    }


    callFunction = async function(contract: Contract){
        const result=await contract.evaluateTransaction("QueryCouchDB", "{\"selector\":{}}")
        console.log('Transaction has been submitted');
        console.log(result.toString());
        console.log('--------------------------------');
    }

    eventListener = async function(contract: Contract){
        const listener = async (event: ContractEvent) => {
            const payload = event.payload.toString('utf8');
            console.log("Event: " + event.eventName + ". Payload: " + payload);
        };
        console.log("Event listener started...")

        const checkpointer: Checkpointer = await DefaultCheckpointers.file('checkPointer');
        const contractListener: ContractListener = await contract.addContractListener(listener, {checkpointer});
    }
}


const app = new App();
app.main();