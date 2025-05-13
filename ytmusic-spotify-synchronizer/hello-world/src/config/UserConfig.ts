import {SpotifyService} from "../services/SpotifyService.js";
import {YtMusicService} from "../services/YtMusicService.js";
import {HCPVaultService} from "../services/VaultService.js";
import {GoogleCredentials, ServerCredentials} from "../model/VaultService.js";
import {AccessToken, SpotifyApi} from "@spotify/web-api-ts-sdk";
import logger from "../util/logger.js";
import {google} from "googleapis";
import {IntializationError} from "../Errors/InitializationError.js";

export class UserConfig {
    private vaultService: HCPVaultService;
    private readonly user: string;
    private readonly spotifyClientId: string;
    private readonly spotifyClientSecret: string;

    private spotifyService: SpotifyService;
    private ytMusicService: YtMusicService;
    private googleOauth2Client: any;

    constructor(
        vaultService: HCPVaultService,
        user: string,
        spotifyClientId: string,
        spotifyClientSecret: string,
    ) {
        this.vaultService = vaultService;
        this.user = user;
        this.spotifyClientId = spotifyClientId;
        this.spotifyClientSecret = spotifyClientSecret;
    }

    public async initialize() {
        const googleUserCreds: GoogleCredentials = await this.vaultService.getUserGoogleCredentials(this.user);
        const spotifyUserCreds: AccessToken = await this.vaultService.getUserSpotifyCredentials(this.user);
        // configure google oauth2 client with user credentials if they are present
        if (googleUserCreds?.refresh_token) {
            this.googleOauth2Client.setCredentials({
                refresh_token: googleUserCreds.refresh_token
            });
        }
        this.ytMusicService = new YtMusicService(this.googleOauth2Client);
        await this.ytMusicService.initialize();
        // configure spotify service with user credentials if they are present
        if (spotifyUserCreds.refresh_token) {
            this.spotifyService = new SpotifyService(
                this.setupSpotifyService(spotifyUserCreds),
                this.spotifyClientId,
                this.spotifyClientSecret,
                spotifyUserCreds.refresh_token,
                this.vaultService.setUserSpotifyCredentials(this.user)
            );

            // refresh the accessToken before interacting with the api.
            await this.spotifyService.initialize();
        }
    }

    private initializeGoogleOauth2Client = ({client_id, client_secret, redirect_uri}: ServerCredentials): void => {
        logger.info("Initializing google oauth client");
        this.googleOauth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uri
        );

        if (!this.googleOauth2Client) {
            throw new IntializationError("The service failed to connect to google");
        }
        logger.info("Google service initialized successfully");
    }

    private setupSpotifyService = (spotifyUserCreds: AccessToken): SpotifyApi => {
        logger.info("Initializing spotify api with user credentials.");
        let spotifyApi = SpotifyApi.withAccessToken(this.spotifyClientId, spotifyUserCreds);
        logger.info("Spotify service initialized successfully")
        return spotifyApi;
    }

    public getSpotifyService() {
        return this.spotifyService
    }

    public getYtMusicService() {
        return this.ytMusicService;
    }
}