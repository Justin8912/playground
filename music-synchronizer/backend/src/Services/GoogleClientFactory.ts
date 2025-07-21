import { HCPVaultService } from "./VaultService.js";
import { ServerCredentials, GoogleCredentials } from "../Model/VaultService.js";
import { google } from "googleapis";

export class GoogleClientFactory {
    private vaultService: HCPVaultService;

    constructor(vaultService: HCPVaultService) {
        this.vaultService = vaultService;
    }

    getUserSpecificGoogleClient = async (userId: string) => {
        const serverCreds: ServerCredentials = await this.vaultService.getServerGoogleCredentials();
        const oauth2Client = new google.auth.OAuth2(
            serverCreds.client_id,
            serverCreds.client_secret,
            serverCreds.redirect_uri
        );
        const userCreds: GoogleCredentials = await this.vaultService.getUserGoogleCredentials(userId);
        if (userCreds?.refresh_token) {
            oauth2Client.setCredentials({ refresh_token: userCreds.refresh_token });
        }
        return oauth2Client;
    }
}