import {Client} from "@litehex/node-vault";

export class HCPVaultService {
    private vaultClient: Client;

    constructor() {
        this.initializeClient();
    }

    public initializeClient = () => {
        this.vaultClient = new Client({
            apiVersion: "v1",
            endpoint: "http://100.82.133.11:8200",
            token: "hvs.JPUjwVoVsjH3mrQhMDfnLKfe"
        });
    }

    public getParameter = async (name: string): Promise<Record<string, string> | undefined> => {
        const res = await this.vaultClient.kv2.read({
            mountPath: "kv/",
            path: `/music-synchronizer/${name}`
        });

        return res?.data?.data?.data;
    }

    public setParameter = async (name: string, data: Record<string, any>): Promise<void> => {
        let parameterData:Record<string, any> = {data: data};
        let currData = await this.getParameter(name);
        if (currData) {
            parameterData = {data:{...currData, ...parameterData.data}}
        }

        let result: Response = await fetch(`http://100.82.133.11:8200/v1/kv/data/music-synchronizer/${name}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.vaultClient.token}`
            },
            body: JSON.stringify(parameterData)
        });

        if (result.status !== 200) {
            throw new Error(`Unexpected response code while setting parameter: ${result.status}`)
        }
        return;
    }
}