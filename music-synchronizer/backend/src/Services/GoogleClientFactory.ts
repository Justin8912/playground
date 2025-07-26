import { HCPVaultService } from "./VaultService.js";
import { ServerCredentials, GoogleCredentials } from "../Model/VaultService.js";
import { google } from "googleapis";
import {OAuth2Client} from "google-auth-library";

export const getGoogleUserClient = async (userId: string, vaultService: HCPVaultService): Promise<OAuth2Client> => {
    const serverCreds: ServerCredentials = await vaultService.getServerGoogleCredentials();
    const oauth2Client = new google.auth.OAuth2(
        serverCreds.client_id,
        serverCreds.client_secret,
        serverCreds.redirect_uri
    );
    const userCreds: GoogleCredentials = await vaultService.getUserGoogleCredentials(userId);
    if (userCreds?.refresh_token) {
        oauth2Client.setCredentials({ refresh_token: userCreds.refresh_token });
    }
    return oauth2Client;
}