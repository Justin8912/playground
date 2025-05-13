import {Client} from "@litehex/node-vault";
import {HCPVaultError} from "../Errors/HCPVaultError.js";
import logger from "../util/logger.js";
import {AccessToken} from "@spotify/web-api-ts-sdk";
import {GoogleCredentials, ServerCredentials} from "../model/VaultService.js";

export class HCPVaultService {
    private vaultClient: Client;
    private readonly user: string;

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
            logger.info(`Getting the parameter: /music-synchronizer/${name}`)
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

            logger.debug("Setting parameter: ", {name, parameterData})
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

    public getUserSpotifyCredentials = async(user: string): Promise<AccessToken> => {
        logger.debug(`Getting spotify user credentials for ${user}`);
        return await this.getParameter(`spotify/${user}`) as unknown as AccessToken;
    }

    public setUserSpotifyCredentials = (user: string) => {
        return async (accessToken: AccessToken): Promise<void> => {
            logger.debug(`Setting spotify user credentials for ${user}`);
            await this.setParameter(`spotify/${this.user}`, accessToken);
        }
    }


    public getUserGoogleCredentials = async (user: string): Promise<GoogleCredentials> => {
        logger.debug(`Getting google user credentials for ${user}`);
        return await this.getParameter(`google/${user}`) as unknown as GoogleCredentials;
    }

    public setUserGoogleCredentials = async (accessToken: GoogleCredentials, user: string): Promise<void> => {
        logger.debug(`Setting google user credentials for ${user}`);
        await this.setParameter(`google/${user}`, accessToken);
    }

    public getServerSpotifyCredentials = async(): Promise<ServerCredentials> => {
        logger.debug(`Getting server credentials for spotify`);
        return await this.getParameter("util/spotify") as unknown as ServerCredentials
    }

    public getServerGoogleCredentials = async (): Promise<ServerCredentials> => {
        logger.debug(`Getting server credentials for google`);
        return await this.getParameter("util/google") as unknown as ServerCredentials
    }
}