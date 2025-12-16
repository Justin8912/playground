import {HCPVaultService} from "../Services/VaultService.js";
import {EnvironmentConfig} from "./EnvironmentConfig.js";
import {google} from 'googleapis';
import {InitializationError} from "../Errors/InitializationError.js";
import {ServerCredentials} from "../Model/VaultService.js";

export class AppConfig {
    private environmentConfig: EnvironmentConfig;
    private hcpVaultService: HCPVaultService;
    private googleOauth2Client: any;
    private spotifyServerCreds: ServerCredentials;

    constructor() { }

    initialize = async (): Promise<void> => {
        this.environmentConfig = new EnvironmentConfig();
        this.hcpVaultService = this.getHcpVaultService();
        await this.initializeGoogleOauth2Client();
        await this.initializeSpotifyServerCredentials();
    }

    getEnvironmentConfig = (): EnvironmentConfig => {
        return this.environmentConfig;
    }

    getHcpVaultService = (): HCPVaultService => {
        if (!this.hcpVaultService) return new HCPVaultService(this.environmentConfig.getVaultToken());
        else return this.hcpVaultService;
    }

    initializeGoogleOauth2Client = async (): Promise<void> => {
        const {client_id, client_secret, redirect_uri} = await this.getHcpVaultService().getServerGoogleCredentials()
        this.googleOauth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uri
        );

        if (!this.googleOauth2Client) {
            throw new InitializationError("The service failed to connect to google");
        }
    }

    initializeSpotifyServerCredentials = async (): Promise<void> => {
        this.spotifyServerCreds = await this.getHcpVaultService().getServerSpotifyCredentials();
    }

    getGoogleOauth2Client = (): any => {
        return this.googleOauth2Client;
    }

    getSpotifyServerCredentials = (): ServerCredentials => {
        return this.spotifyServerCreds;
    }
}