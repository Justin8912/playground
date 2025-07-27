import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { SpotifyClient } from "./SpotifyClientFactory.js";
import { HCPVaultService } from "./VaultService.js";

export class SpotifyService {
    private spotifyClient: SpotifyClient;
    private spotifyApi: SpotifyApi;

    constructor(
        spotifyClient: SpotifyClient,
    ) {
        this.spotifyClient = spotifyClient;
    }

    initialize = async () => {
        try {
            await this.spotifyClient.initialize();
            this.setSpotifyApi(this.spotifyClient.getSpotifyClient());
            console.info("Spotify Service initialized successfully.");
        } catch (err) {
            throw new Error("Failed to initialize Spotify Service", { cause: err });
        }
    }

    private setSpotifyApi = (spotifyApi: SpotifyApi) => {
        this.spotifyApi = spotifyApi;
    }

    public getPlaylistIds = async () => {
        
    }

    public addSongsToPlaylist = async () => {}

    private addSongToPlaylist = async () => {}

    public getPlaylistByName = async (name: string) => {}

    public removeSongFromPlaylist = async () => {}
}

export const getSpotifyService = async (
    spotifyClient: SpotifyClient
): Promise<SpotifyService> => {
    const spotifyService = new SpotifyService(spotifyClient);
    await spotifyService.initialize();
    return spotifyService;
}