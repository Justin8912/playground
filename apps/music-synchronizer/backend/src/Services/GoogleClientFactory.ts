import { HCPVaultService } from "./VaultService.js";
import { ServerCredentials, GoogleCredentials } from "../Model/VaultService.js";
import { google } from "googleapis";
import {OAuth2Client} from "google-auth-library";

export class GoogleUserClient {
    private vaultService: HCPVaultService;
    private userId: string;
    private authClient: OAuth2Client;

    constructor(
        vaultService: HCPVaultService, 
        userId: string
    ) {
        this.vaultService = vaultService;
        this.userId = userId;
    }

    initialize = async (): Promise<OAuth2Client> => {
        const serverCreds: ServerCredentials = await this.vaultService.getServerGoogleCredentials();
        const oauth2Client = new google.auth.OAuth2(
            serverCreds.client_id,
            serverCreds.client_secret,
            serverCreds.redirect_uri
        );
        const userCreds: GoogleCredentials = await this.vaultService.getUserGoogleCredentials(this.userId);
        if (userCreds?.refresh_token) {
            oauth2Client.setCredentials({ refresh_token: userCreds.refresh_token });
        }
        this.authClient = oauth2Client;
        return oauth2Client;
    }

    refreshAccessToken = async (): Promise<void> => {
        try {
            const tokens = await this.authClient.refreshAccessToken();
            const credentials = tokens.credentials;
            
            this.authClient.setCredentials({
                access_token: credentials.access_token,
                refresh_token: credentials.refresh_token,
            });
            
            console.log('Access token refreshed successfully');
        } catch (error) {
            throw new Error('Failed to refresh YouTube Music access token: ' + error);
        }
    }

    validateToken = async(): Promise<void> => {
        try {
            const tokenInfo = this.authClient.credentials;
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (!tokenInfo || !tokenInfo.expiry_date || tokenInfo.expiry_date < currentTime) {
                console.log('Token expired or missing, refreshing...');
                await this.refreshAccessToken();
            }
        } catch (error) {
            throw new Error('Failed to ensure valid YouTube Music token: ' + error);
        }
    }

    getAuthClient = (): OAuth2Client => {
        if (!this.authClient) {
            throw new Error("Auth client is not initialized. Call initialize() first.");
        }
        return this.authClient;
    }
}

export const getGoogleUserClient = async (userId: string, vaultService: HCPVaultService): Promise<GoogleUserClient> => {
    const userClient = new GoogleUserClient(vaultService, userId);
    await userClient.initialize();
    return userClient;
}