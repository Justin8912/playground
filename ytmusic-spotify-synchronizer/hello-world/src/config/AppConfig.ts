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
        this.initializer();
    }

    public initializer = () => {
        this.spotifyService = new SpotifyService();
        this.ytMusicService = new YtMusicService();
        this.vaultService = new HCPVaultService(
            this.getEnvironmentConfig().getVaultToken()
        );
        this.googleOauth2Client = new google.auth.OAuth2(
            this.getEnvironmentConfig().getGoogleClientId(),
            this.getEnvironmentConfig().getGoogleClientSecret(),
            this.getEnvironmentConfig().getGoogleClientRedirectUri()
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

    public getGoogleOauth2Client = () => {
        return this.googleOauth2Client;
    }

    public getEnvironmentConfig = () => {
        return this.environmentConfig;
    }

}