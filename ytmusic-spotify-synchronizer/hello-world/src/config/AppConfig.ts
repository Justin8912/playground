import {SpotifyService} from "../services/SpotifyService.js";
import {YtMusicService} from "../services/YtMusicService.js";
import {EnvironmentConfig} from "./EnvironmentConfig.js";
import {HCPVaultService} from "../services/VaultService.js";
import {google} from "googleapis";


export class AppConfig {
    private readonly environmentConfig: EnvironmentConfig;
    private spotifyService: SpotifyService;
    private ytMusicService: YtMusicService;
    private vaultService: HCPVaultService;
    private googleOauth2Client: any;

    constructor(envConfig: EnvironmentConfig) {
        this.environmentConfig = envConfig;
        this.initialize();
    }

    public initialize = () => {
        this.spotifyService = new SpotifyService();
        this.ytMusicService = new YtMusicService();
        this.vaultService = new HCPVaultService(
            this.getEnvironmentConfig().getVaultToken()
        );
    }

    public getAccessToken = async () => {

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

    public initializeGoogleOauth2Client = async () => {
        let {GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI} =
            await this.vaultService.getParameter("util") as any;

        this.googleOauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            GOOGLE_REDIRECT_URI
        );
    }

    public getGoogleOauth2Client = async () => {
        if (!this.googleOauth2Client) {
            await this.initializeGoogleOauth2Client();
        }
        return this.googleOauth2Client;
    }

    public getEnvironmentConfig = () => {
        return this.environmentConfig;
    }

}