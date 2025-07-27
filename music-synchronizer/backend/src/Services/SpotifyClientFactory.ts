import { HCPVaultService } from "./VaultService.js";
import { AccessToken, SpotifyApi } from "@spotify/web-api-ts-sdk";

export class SpotifyClient {
    private vaultService: HCPVaultService;
    private spotifyClient: SpotifyApi;
    private userId: string;
    
    constructor(
        vaultService: HCPVaultService, 
        userId: string
    ) {
        this.vaultService = vaultService;
        this.userId = userId;
    }

    initialize = async () => {
        try {
            await this.refreshSpotifyClient();
            console.info("Spotify Client initialized successfully.");
        } catch (err) {
            throw new Error("Failed to initialize Spotify Client", { cause: err });
        }
    }

    refreshSpotifyClient = async (): Promise<void> => {
        console.log("Refreshing spotify access token for user");

        const { client_id: clientId, client_secret: clientSecret } = await this.vaultService.getServerSpotifyCredentials();
        const {refresh_token} = await this.vaultService.getUserSpotifyCredentials(
            this.userId
        );

        const url = "https://accounts.spotify.com/api/token";
        const payload = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refresh_token,
                client_id: clientId
            }),
        }
        const body = await fetch(url, payload);
        const response = await body.json();

        const accessToken: AccessToken = {
            access_token: response.access_token,
            token_type: response.token_type,
            expires_in: response.expires_in,
            refresh_token: refresh_token
        }

        await this.vaultService.setUserSpotifyCredentials(
            this.userId, accessToken
        );

        this.spotifyClient = SpotifyApi.withAccessToken(clientId, accessToken);
    }

    public getSpotifyClient = (): SpotifyApi => {
        return this.spotifyClient;
    }
}

export const getSpotifyUserClient = async (
    vaultService: HCPVaultService, 
    userId: string
) => {
    const spotifyClient = new SpotifyClient(vaultService, userId);
    await spotifyClient.initialize();
    return spotifyClient;   
}