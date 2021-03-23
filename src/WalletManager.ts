import { Wallets, Wallet, Gateway, Network, Contract } from "fabric-network";
import * as fs from "fs";
import * as yaml from 'js-yaml';

export class WalletManager {
   
    static GetContractWithConfig = async function(walletPath: string, orgMSPId:string, walletIdentityLabel: string, certPathMSP: string, privateKeyPathMSP: string, certPathTLS: string, privateKeyPathTLS: string, connectionProfileFilePath: string, channelName: string, contractName: string): Promise<Contract>{
        const wallet: Wallet = await Wallets.newFileSystemWallet(walletPath);
        const walletIdentityLabelTLS = walletIdentityLabel + 'TLS';
        WalletManager.PopulateWallet(wallet, orgMSPId, walletIdentityLabel, certPathMSP, privateKeyPathMSP);
        WalletManager.PopulateWallet(wallet, orgMSPId, walletIdentityLabelTLS, certPathTLS, privateKeyPathTLS);
        const gateway: Gateway = await WalletManager.ConnectToGateway(walletIdentityLabel, walletIdentityLabelTLS, wallet, connectionProfileFilePath);
        const contract: Contract = await WalletManager.GetContract(gateway, channelName, contractName);
        return contract;
    }

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

    private static ConnectToGateway = async function(walletIdentityLabel: string, walletIdentityLabelTLS: string, wallet: Wallet, connectionProfileFilePath: string): Promise<Gateway>{
        const gatewayOptions = {
            identity: walletIdentityLabel,
            clientTlsIdentity: walletIdentityLabelTLS,
            wallet: wallet,
            discovery: {enabled: false, asLocalhost: false}
        };
        const gateway: Gateway = new Gateway();
        const cppFile: string = fs.readFileSync(connectionProfileFilePath, "utf8");
        const ccp: Object = yaml.load(cppFile);
        await gateway.connect(ccp, gatewayOptions);
        return gateway;
    }

    private static GetContract = async function(gateway: Gateway, channelName: string, contractName: string): Promise<Contract> {
        const network: Network = await gateway.getNetwork(channelName);
        const contract: Contract = network.getContract(contractName);
        return contract;
    }
}
