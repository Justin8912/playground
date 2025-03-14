import {SpotifyService} from "../services/SpotifyService.js";
import {YtMusicService} from "../services/YtMusicService.js";
import {EnvironmentConfig} from "./EnvironmentConfig.js";

export class AppConfig {
    private readonly environmentConfig: EnvironmentConfig;
    private spotifyService: SpotifyService;
    private ytMusicService: YtMusicService;

    constructor(envConfig: EnvironmentConfig) {
        this.environmentConfig = envConfig;
    }

    public initializer = () => {
        this.spotifyService = new SpotifyService();
        this.ytMusicService = new YtMusicService();
    }

    public getAccessToken = async () => {

    }

    public getSpotifyService = () => {
        return this.spotifyService;
    }

    public getYtMusicService = () => {
        return this.ytMusicService;
    }
}