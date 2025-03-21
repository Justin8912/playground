import {SpotifyApi} from "@spotify/web-api-ts-sdk";

export class SpotifyService{
    private spotifyClient: SpotifyApi;
    private userId: string;

    constructor(spotifyClient: SpotifyApi) {
        this.spotifyClient = spotifyClient;
    }

    initialize = async () => {
        try {
            await this.getUserId();
        } catch (error) {
            console.error("Failed to initialize SpotifyService: ", error);
            throw error;
        }
    }

    getUserId = async (): Promise<string> => {
        const user = await this.spotifyClient.currentUser.profile();
        console.log("Here is the spotify user: ", user)
        return user.id;
    }

    getPlaylists = async () => {
        return await this.spotifyClient.currentUser.playlists.playlists(50);
    }
    retrieveSongs = (playlist) => {}

    // For communicating between different applications
    formatMetadata = (song) => {}

    searchForSong = () => {}

    createPlaylist = () => {}
    addSongToPlaylist = () => {}

    // This should be a later implementation, first pass should only be additive changes
    removeSongFromPlaylist = () => {}
}