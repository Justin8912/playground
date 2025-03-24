import {SpotifyService} from "../services/SpotifyService.js";
import {YtMusicService} from "../services/YtMusicService.js";
import {EnvironmentConfig} from "./EnvironmentConfig.js";
import {HCPVaultService} from "../services/VaultService.js";
import {google} from "googleapis";
import {IntializationError} from "../Errors/InitializationError.js";
import {AccessToken, SpotifyApi} from "@spotify/web-api-ts-sdk";
import {request} from "node:https";
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

        this.spotifyService = new SpotifyService(await this.setupSpotifyService());
        await this.spotifyService.initialize();
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
            this.getEnvironmentConfig().getVaultToken()
        );

        if (!this.vaultService) {
            throw new IntializationError("The service failed to connect to vault service");
        }
    }

    private setupSpotifyService = async (): Promise<SpotifyApi> => {
        let userCreds = await this.getVaultService().getParameter(this.getEnvironmentConfig().getUser());
        if (userCreds.spotifyAccessToken && userCreds.spotifyRefreshToken) {
            logger.info("Information found for user, setting up spotify service with user credentials.");
            let accessToken: AccessToken = {
                access_token: userCreds.spotifyAccessToken,
                refresh_token: userCreds.spotifyRefreshToken,
                token_type: userCreds.spotifyTokenType,
                expires_in: parseInt(userCreds.spotifyTokenExpiresIn)
            }
            return SpotifyApi.withAccessToken(this.getSpotifyClientId(), accessToken);
        } else {
            logger.info("Information not found for user, setting up spotify service with client credentials.");
            return SpotifyApi.withClientCredentials(
                this.getSpotifyClientId(),
                this.getSpotifyClientSecret(),
                []
            );
        }
    }

    public getSpotifyAuthorizationUri = (state: string): string => {
        const baseUrl = "https://accounts.spotify.com/authorize";
        const queryParams = [
            ["response_type", "code"],
            ["scopes", this.getEnvironmentConfig().getSpotifyScopes().join(",")],
            ["client_id", this.spotifyClientId],
            ["redirect_uri", this.spotifyRedirectUri],
            ["state", state]
        ]
        const searchParams = new URLSearchParams(queryParams);

        return baseUrl + "?" + searchParams.toString();
    }

    public getSpotifyService = () => {
        return this.spotifyService;
    }

    public getYtMusicService = (user?: string) => {
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
