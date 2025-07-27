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

    }
}

export const getSpotifyService = async (
    spotifyClient: SpotifyClient
): Promise<SpotifyService> => {
    const spotifyService = new SpotifyService(spotifyClient);
    await spotifyService.initialize();
    return spotifyService;
}