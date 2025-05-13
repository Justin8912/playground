import {SpotifyService} from "../services/SpotifyService.js";
import {YtMusicService} from "../services/YtMusicService.js";
import {EnvironmentConfig} from "./EnvironmentConfig.js";
import {HCPVaultService} from "../services/VaultService.js";
import {google} from "googleapis";
import {IntializationError} from "../Errors/InitializationError.js";
import {AccessToken, SpotifyApi} from "@spotify/web-api-ts-sdk";
import logger from "../util/logger.js";
import {GoogleCredentials, ServerCredentials} from "../model/VaultService.js";

export class AppConfig {
    private readonly environmentConfig: EnvironmentConfig;
    private spotifyService: SpotifyService;
    private ytMusicService: YtMusicService;
    private vaultService: HCPVaultService;
    private googleOauth2Client: any;
    private spotifyServerCreds: ServerCredentials;

    constructor(envConfig: EnvironmentConfig) {
        this.environmentConfig = envConfig;
    }

    public initialize = async () => {
        logger.info("Initializing AppConfig");
        const user = this.getEnvironmentConfig().getUser();
        this.initializeVaultService(
            this.getEnvironmentConfig().getVaultToken(),
            this.getEnvironmentConfig().getUser()
        );
        this.initializeGoogleOauth2Client(
            await this.vaultService.getServerGoogleCredentials()
        );
        this.spotifyServerCreds = await this.vaultService.getServerSpotifyCredentials();

        const googleUserCreds: GoogleCredentials = await this.vaultService.getUserGoogleCredentials(user);
        const spotifyUserCreds: AccessToken = await this.vaultService.getUserSpotifyCredentials(user);
        // configure google oauth2 client with user credentials if they are present
        if (googleUserCreds?.refresh_token) {
            this.getGoogleOauth2Client().setCredentials({
                refresh_token: googleUserCreds.refresh_token
            });
        }
        this.ytMusicService = new YtMusicService(this.getGoogleOauth2Client());
        await this.ytMusicService.initialize();
        // configure spotify service with user credentials if they are present
        if (spotifyUserCreds.refresh_token) {
            this.spotifyService = new SpotifyService(
                this.setupSpotifyService(spotifyUserCreds),
                this.spotifyServerCreds.client_id,
                this.spotifyServerCreds.client_secret,
                spotifyUserCreds.refresh_token,
                this.vaultService.setUserSpotifyCredentials(user)
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

    private initializeVaultService = (vaultToken: string, user: string) => {
        logger.info("Initializing vault");
        this.vaultService = new HCPVaultService(
            vaultToken,
            user
        );

        if (!this.vaultService) {
            throw new IntializationError("The service failed to connect to vault service");
        }
        logger.info("Vault initialized successfully");
    }

    private setupSpotifyService = (spotifyUserCreds: AccessToken): SpotifyApi => {
        logger.info("Initializing spotify api with user credentials.");
        let spotifyApi = SpotifyApi.withAccessToken(this.getSpotifyClientId(), spotifyUserCreds);
        logger.info("Spotify service initialized successfully")
        return spotifyApi;
    }

    public getSpotifyService = () => {
        return this.spotifyService;
    }

    public getYtMusicService = () => {
        return this.ytMusicService;
    }

    public getVaultService = () => {
        return this.vaultService;
    }

    public getGoogleOauth2Client = () => {
        return this.googleOauth2Client;
    }

    public getEnvironmentConfig = () => {
        return this.environmentConfig;
    }

    public getSpotifyRedirectUri = () => {
        return this.spotifyServerCreds.redirect_uri;
    }

    public getSpotifyClientId = () => {
        return this.spotifyServerCreds.client_id
    }

    public getSpotifyClientSecret = () => {
        return this.spotifyServerCreds.client_secret
    }
}
