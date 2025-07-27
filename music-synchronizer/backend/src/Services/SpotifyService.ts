import { SpotifyClient } from "./SpotifyClientFactory.js";
import { HCPVaultService } from "./VaultService.js";

export class SpotifyService {
    private spotifyClient: SpotifyClient;

    constructor(
        spotifyClient: SpotifyClient,
    ) {
        this.spotifyClient = spotifyClient;
    }

    initialize = async () => {
        try {
            await this.spotifyClient.refreshAccessToken();
            console.info("Spotify Service initialized successfully.");
        } catch (err) {
            throw new Error("Failed to initialize Spotify Service", { cause: err });
        }
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