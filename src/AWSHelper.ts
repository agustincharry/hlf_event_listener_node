import * as SecretsManager from 'aws-sdk/clients/secretsmanager';
import * as ACMPCA from 'aws-sdk/clients/acmpca';
import * as STS from 'aws-sdk/clients/sts';

export class AWSHelper {

    static assumeRole = async function(RoleArn: string) {
        const roleToAssume = {
            RoleArn,
            RoleSessionName: 'session1',
            DurationSeconds: 900
        };
        const sts: STS = new STS();
        const data = await sts.assumeRole(roleToAssume).promise();
        const roleCreds = {
            accessKeyId: data.Credentials.AccessKeyId,
            secretAccessKey: data.Credentials.SecretAccessKey,
            sessionToken: data.Credentials.SessionToken
        };
        await this.stsGetCallerIdentity(roleCreds);
    }
    private static stsGetCallerIdentity = async function(creds: any) {
        const stsParams = {credentials: creds };
        const sts: STS = new STS(stsParams);
        const data = await sts.getCallerIdentity().promise();
        console.log(data.Arn);
    }
    
    static getAWSSecret = async function(SecretId: string) {
        const secretsManager: SecretsManager = new SecretsManager({region:process.env.AWS_REGION});
        const data = await secretsManager.getSecretValue({ SecretId }).promise();
        return data;
    }

    static getCertByARN = async function(CertificateArn: string, CertificateAuthorityArn: string) {
        const acmpca: ACMPCA = new ACMPCA({region:process.env.AWS_REGION});
        const data = await acmpca.getCertificate({CertificateArn, CertificateAuthorityArn}).promise();
        return data;
    }
}