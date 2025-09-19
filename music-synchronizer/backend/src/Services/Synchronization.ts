import {YoutubeMusicClientService} from "./YoutubeMusicClientService.js";
import {SpotifyService} from "./SpotifyService.js";
import {GetPlaylistsResponse} from "../Model/MusicService.js";

export const synchronizeMusicSources = async (
    sourceClient: YoutubeMusicClientService | SpotifyService,
    targetClient: YoutubeMusicClientService | SpotifyService
): Promise<boolean> => {
    try {
        // Get the playlists from the source client
        const sourcePlaylists: GetPlaylistsResponse = await sourceClient.getPlaylists();
        // Get the playlists from the target client
        const targetPlaylists: GetPlaylistsResponse = await targetClient.getPlaylists();

        // For each playlist in the source client, check if it exists in the target client
        for (const sourcePlaylist of sourcePlaylists) {
            // If it does, lets just go ahead and add them for now.
            if (await targetClient.getPlaylistByName(sourcePlaylist.title)) {
                // Add all the songs to the playlist
                await targetClient.addSongsToPlaylist(sourcePlaylist.title, sourcePlaylist.songs);
            }
        }
        return true;
    } catch (error) {
        console.error("Something went wrong", {cause: error});
        return false
    }


}