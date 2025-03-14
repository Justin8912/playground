import {SSMClient} from "@aws-sdk/client-ssm";

export const getSSMParameter = async (parameterName: string): Promise<string> => {

    return "";
}

export const setSSMParamter = async (paramterName: string, value: string): Promise<void> => {

    return
}

export class SSMService {
    private ssmClient: SSMClient;

    constructor() {

    }

    public initializeClient = (region: string = "us-east-1") => {
        this.ssmClient = new SSMClient({
            region: region
        });
    }

    public getSSMParamter = (name: string): Promise<string> => {
        return Promise.resolve("Yay!");
    }

    public setSSMParamter = (name: string, value: string): Promise<void> => {
        return Promise.resolve();
    }
}