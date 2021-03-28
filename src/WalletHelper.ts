import { Wallets, Wallet, Gateway, Network, Contract, HsmX509Identity, HsmX509Provider } from "fabric-network";
import { ICryptoKey } from "fabric-common";
import * as fs from "fs";
import * as yaml from 'js-yaml';
import { log } from './LogHelper'

export class WalletHelper {

    /**
     * Function used to connect to the Blockchain wiht credentials.
     * 
     * @param {string} walletPath               Folder path which will store the wallet info.
     * @param {string} orgMSPId                 MSP ID of the organization.
     * @param {string} walletIdentityLabel      Label which will identify the wallet credentials.
     * @param {string} certPathMSP              Path of the public MSP certificate .pem
     * @param {string} privateKeyPathMSP        Path of the MSP private key of the certificate
     * @param {string} certPathTLS              Path of the public TLS certificate .crt
     * @param {string} privateKeyPathTLS        Path of the TLS private key of the certificate
     * @param {string} connProfileFilePath      Path of the Connection Profile File .yaml
     * @param {string} channelName              Name of the channel.
     * @param {string} contractName             Name of the contract.
     * @returns 
     */
    static GetContractWithConfig = async function(walletPath: string, orgMSPId:string, walletIdentityLabel: string, certPathMSP: string, privateKeyPathMSP: string, certPathTLS: string, privateKeyPathTLS: string, connProfileFilePath: string, channelName: string, contractName: string): Promise<Contract>{
        const wallet: Wallet = await Wallets.newFileSystemWallet(walletPath);
        const walletIdentityLabelTLS = walletIdentityLabel + 'TLS';
        WalletHelper.PopulateWallet(wallet, orgMSPId, walletIdentityLabel, certPathMSP, privateKeyPathMSP);
        WalletHelper.PopulateWallet(wallet, orgMSPId, walletIdentityLabelTLS, certPathTLS, privateKeyPathTLS);
        const gateway: Gateway = await WalletHelper.ConnectToGateway(walletIdentityLabel, walletIdentityLabelTLS, wallet, connProfileFilePath);
        const contract: Contract = await WalletHelper.GetContract(gateway, channelName, contractName);
        return contract;
    }


    static GetContractWithConfigHSM = async function(walletPath: string, orgMSPId:string, walletIdentityLabel: string, certPathMSP: string, certPathTLS: string, privateKeyPathTLS: string, connProfileFilePath: string, channelName: string, contractName: string, HSMLib: string, HSMPin: string, HSMSlot: number, privateKeySKI: string): Promise<Contract>{
        const wallet: Wallet = await Wallets.newFileSystemWallet(walletPath);
        const walletIdentityLabelTLS = walletIdentityLabel + 'TLS';
        //const HSMLib: string = '/home/hacharry/projects/hlf_event_listener_node/test/test/libsofthsm2.so';
        
        
        WalletHelper.PopulateWalletFromHSM(wallet, orgMSPId, walletIdentityLabel, certPathMSP, HSMLib, HSMPin, HSMSlot, privateKeySKI);
        WalletHelper.PopulateWallet(wallet, orgMSPId, walletIdentityLabelTLS, certPathTLS, privateKeyPathTLS);
        const gateway: Gateway = await WalletHelper.ConnectToGateway(walletIdentityLabel, walletIdentityLabelTLS, wallet, connProfileFilePath);
        const contract: Contract = await WalletHelper.GetContract(gateway, channelName, contractName);
        return contract;
    }

    /**
     * Function used to populate a wallet with a public certificate and a private key.
     * 
     * @param {Wallet} wallet                   Wallet which will store the credentials
     * @param {string} orgMSPId                 MSP ID of the organization
     * @param {string} walletIdentityLabel      Label which will identify the wallet credentials
     * @param {string} certPath                 Path of the public certificate .pem
     * @param {string} privateKeyPath           Path of the private key of the certificate
     */
    private static PopulateWallet = async function(wallet: Wallet, orgMSPId: string, walletIdentityLabel: string, certPath: string, privateKeyPath: string){
        const cert = fs.readFileSync(certPath, "utf8");
        const key = fs.readFileSync(privateKeyPath, "utf8");
    
        const identity = {
            credentials: {
                certificate: cert,
                privateKey: key,
            },
            mspId: orgMSPId,
            type: 'X.509',
        };
        await wallet.put(walletIdentityLabel, identity);
    }

    /**
     * Function used to connect and authenticate in the Blockchain
     * 
     * @param {string} walletIdentityLabel      Label which will identify the MSP wallet credentials
     * @param {string} walletIdentityLabelTLS   Label which will identify the TLS wallet credentials
     * @param {Wallet} wallet                   Wallet which has the credentials
     * @param {string} connProfileFilePath      Path of the Connection Profile File .yaml
     * @returns {Promise<Gateway>}              Gateway.
     */
    private static ConnectToGateway = async function(walletIdentityLabel: string, walletIdentityLabelTLS: string, wallet: Wallet, connProfileFilePath: string): Promise<Gateway>{
        const gatewayOptions = {
            identity: walletIdentityLabel,
            clientTlsIdentity: walletIdentityLabelTLS,
            wallet: wallet,
            discovery: {enabled: false, asLocalhost: false}
        };
        const gateway: Gateway = new Gateway();
        const cppFile: string = fs.readFileSync(connProfileFilePath, "utf8");
        const ccp: Object = yaml.load(cppFile);
        await gateway.connect(ccp, gatewayOptions);
        return gateway;
    }

    /**
     * Function used to get the Smart Contract of a channel.
     * 
     * @param {Gateway} gateway                 Gateway.
     * @param {string} channelName              Name of the channel.
     * @param {string} contractName             Name of the contract.
     * @returns {Promise<Contract>}             Smart Contract of the Blockchain.
     */
    private static GetContract = async function(gateway: Gateway, channelName: string, contractName: string): Promise<Contract> {
        const network: Network = await gateway.getNetwork(channelName);
        const contract: Contract = network.getContract(contractName);
        return contract;
    }

    /**
     * Function used to populate a wallet with a public certificate and the handler of a private key which is stored
     * in a HSM.
     * This function also adds the HSM provider to the wallet.
     * 
     * @param {Wallet} wallet                   Wallet which will store the credentials
     * @param {string} orgMSPId                 MSP ID of the organization
     * @param {string} walletIdentityLabel      Label which will identify the wallet credentials
     * @param {string} certPath                 Path of the public certificate .pem
     * @param {string} HSMLib                   Path of the HSM library or module .so or .dll
     * @param {string} HSMPin                   PIN to authenticate in the HSM
     * @param {number} HSMSlot                  Slot of HSM
     * @param {string} privateKeySKI            SKI of the private key in the HSM
     */
    private static PopulateWalletFromHSM = async function(wallet: Wallet, orgMSPId: string, walletIdentityLabel: string, certPath: string, HSMLib: string, HSMPin: string, HSMSlot: number, privateKeySKI: string){
        const hsmProvider: HsmX509Provider = new HsmX509Provider({
            lib: HSMLib,
            pin: HSMPin,
            slot: HSMSlot
        });
        wallet.getProviderRegistry().addProvider(hsmProvider);
        
        const key: ICryptoKey = await hsmProvider.getCryptoSuite().getKey(privateKeySKI);
        log.info('Successfully connected with HSM!!')
    
        const cert = fs.readFileSync(certPath, "utf8");

        const identity: HsmX509Identity = {
            credentials: {
               certificate: cert,
               privateKey: key.toBytes()
            },
            mspId: orgMSPId,
            type: 'HSM-X.509',
        };
        await wallet.put(walletIdentityLabel, identity);
    }
}
