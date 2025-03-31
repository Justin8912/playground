import {Client} from "@litehex/node-vault";
import {HCPVaultError} from "../Errors/HCPVaultError.js";
import logger from "../util/logger.js";
import {AccessToken} from "@spotify/web-api-ts-sdk";
import {GoogleCredentials, ServerCredentials} from "../model/VaultService.js";

export class HCPVaultService {
    private vaultClient: Client;
    private user: string;

    constructor(vaultToken: string, user: string) {
        this.initializeClient(vaultToken);
        this.user = user;
    }

    public initializeClient = (vaultToken: string) => {
        this.vaultClient = new Client({
            apiVersion: "v1",
            endpoint: "http://100.82.133.11:8200",
            token: vaultToken
        });
    }

    public getParameter = async (name: string): Promise<Record<string, string>> => {
        if (!name) {
            throw new HCPVaultError("Parameter name is required");
        }

        try {
            console.log(`Getting the parameter: /music-synchronizer/${name}`)
            let res = await fetch(`http://100.82.133.11:8200/v1/kv/data/music-synchronizer/${name}`, {
                headers: {
                    Authorization: `Bearer ${this.vaultClient.token}`
                }
            })
            res = await res.json();
            return res?.data?.data;
        } catch (err) {
            throw new HCPVaultError("Failed to read document from vault", {cause: err});
        }
    }

    public setParameter = async (name: string, data: Record<string, any>): Promise<void> => {
        let parameterData:Record<string, any> = {data: data};
        try {
            let currData = await this.getParameter(name);
            if (currData) {
                parameterData = {data:{...currData, ...parameterData.data}}
            }

            logger.info("Setting parameter: ", {name, parameterData})
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
        } catch (err) {
            throw new HCPVaultError("Failed to write document to vault", {cause: err});
        }
    }

    public removeParameter = async (name: string): Promise<void> => {
        try {
            await this.vaultClient.kv2.deleteMetadata({
                mountPath: "kv/",
                path: `/music-synchronizer/${name}`
            })
            return;
        } catch (err) {
            throw new HCPVaultError("Failed to remove document from vault", {cause: err});
        }
    }

    public getUserSpotifyCredentials = async(): Promise<AccessToken> => {
        return await this.getParameter(`spotify/${this.user}`) as unknown as AccessToken;
    }

    public setUserSpotifyCredentials = async (accessToken: AccessToken): Promise<void> => {
        await this.setParameter(`spotify/${this.user}`, accessToken);
    }

    public getUserGoogleCredentials = async (): Promise<GoogleCredentials> => {
        return await this.getParameter(`google/${this.user}`) as unknown as GoogleCredentials;
    }

    public setUserGoogleCredentials = async (accessToken: GoogleCredentials): Promise<void> => {
        await this.setParameter(`google/${this.user}`, accessToken);
    }

    public getServerSpotifyCredentials = async(): Promise<ServerCredentials> => {
        return await this.getParameter("util/spotify") as unknown as ServerCredentials
    }

    public getServerGoogleCredentials = async (): Promise<ServerCredentials> => {
        return await this.getParameter("util/google") as unknown as ServerCredentials
    }
}