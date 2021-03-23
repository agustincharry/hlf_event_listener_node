import * as SecretsManager from 'aws-sdk/clients/secretsmanager';

export class AWSHelper {
    
    static getAWSSecret = async function(SecretId: string) {
        const secretsManager: SecretsManager = new SecretsManager({region:process.env.REGION});
        const data = await secretsManager.getSecretValue({ SecretId }).promise();
        return data;
    }
}