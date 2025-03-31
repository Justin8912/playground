import {SpotifyService} from "../services/SpotifyService.js";
import {YtMusicService} from "../services/YtMusicService.js";
import {EnvironmentConfig} from "./EnvironmentConfig.js";
import {HCPVaultService} from "../services/VaultService.js";
import {google} from "googleapis";
import {IntializationError} from "../Errors/InitializationError.js";
import {AccessToken, SpotifyApi} from "@spotify/web-api-ts-sdk";
import logger from "../util/logger.js";

export class AppConfig {
    private readonly environmentConfig: EnvironmentConfig;
    private spotifyService: SpotifyService;
    private ytMusicService: YtMusicService;
    private vaultService: HCPVaultService;
    private googleOauth2Client: any;

    private spotifyClientId: string;
    private spotifyClientSecret: string;
    private spotifyRedirectUri: string;

    private spotifyUserCreds;

    constructor(envConfig: EnvironmentConfig) {
        this.environmentConfig = envConfig;
    }

    public initialize = async () => {
        await this.initializeVaultService();
        let {
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            GOOGLE_REDIRECT_URI,
            SPOTIFY_CLIENT_ID,
            SPOTIFY_CLIENT_SECRET,
            SPOTIFY_REDIRECT_URI
        } = await this.vaultService.getParameter("util") as any;

        await this.initializeGoogleOauth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

        const userCreds = await this.vaultService.getParameter(this.getEnvironmentConfig().getUser()) as any;
        const spotifyUserCreds = await this.vaultService.getSpotifyCredentials();
        // configure google oauth2 client with user credentials if they are present
        if (userCreds?.googleRefreshToken) {
            this.getGoogleOauth2Client().setCredentials({
                refresh_token: userCreds.googleRefreshToken
            });
        }
        this.ytMusicService = new YtMusicService(this.getGoogleOauth2Client());

        this.spotifyClientId = SPOTIFY_CLIENT_ID;
        this.spotifyClientSecret = SPOTIFY_CLIENT_SECRET;
        this.spotifyRedirectUri = SPOTIFY_REDIRECT_URI;

        if (spotifyUserCreds.refresh_token) {
            this.spotifyService = new SpotifyService(
                this.setupSpotifyService(),
                SPOTIFY_CLIENT_ID,
                SPOTIFY_CLIENT_SECRET,
                spotifyUserCreds.refresh_token,
                this.vaultService.setSpotifyCredentials
            );
        }
    }

    private initializeGoogleOauth2Client = async (GOOGLE_CLIENT_ID: string, GOOGLE_CLIENT_SECRET: string, GOOGLE_REDIRECT_URI: string) => {
        this.googleOauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            GOOGLE_REDIRECT_URI
        );

        if (!this.googleOauth2Client) {
            throw new IntializationError("The service failed to connect to google");
        }
    }

    private initializeVaultService = async () => {
        this.vaultService = new HCPVaultService(
            this.getEnvironmentConfig().getVaultToken(),
            this.getEnvironmentConfig().getUser()
        );

        if (!this.vaultService) {
            throw new IntializationError("The service failed to connect to vault service");
        }
    }

    private setupSpotifyService = (): SpotifyApi => {
        logger.info("Information found for user, setting up spotify service with user credentials.");
        let accessToken: AccessToken = {
            access_token: this.spotifyUserCreds.spotifyAccessToken,
            refresh_token: this.spotifyUserCreds.spotifyRefreshToken,
            token_type: this.spotifyUserCreds.spotifyTokenType,
            expires_in: parseInt(this.spotifyUserCreds.spotifyTokenExpiresIn)
        }
        return SpotifyApi.withAccessToken(this.getSpotifyClientId(), accessToken);
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
        return this.spotifyRedirectUri;
    }

    public getSpotifyClientId = () => {
        return this.spotifyClientId
    }

    public getSpotifyClientSecret = () => {
        return this.spotifyClientSecret
    }
}
