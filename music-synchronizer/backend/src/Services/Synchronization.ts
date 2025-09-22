import {YoutubeMusicClientService} from "./YoutubeMusicClientService.js";
import {SpotifyService} from "./SpotifyService.js";
import {GetPlaylistsResponse, Song} from "../Model/MusicService.js";
import {findDifferences} from "../Util/findDifferences.js";

export const synchronizeMusicSources = async (
    sourceClient: YoutubeMusicClientService | SpotifyService,
    targetClient: YoutubeMusicClientService | SpotifyService
): Promise<boolean> => {
    try {
        const sourcePlaylists: GetPlaylistsResponse[] = await sourceClient.getPlaylists();

        for (const sourcePlaylist of sourcePlaylists) {
            const targetPlaylist = await targetClient.getPlaylistByName(sourcePlaylist.title)
            if (targetPlaylist) {
                await targetClient.addSongsToPlaylist(sourcePlaylist.title, sourcePlaylist.songs);
            }
        }
        return true;
    } catch (error) {
        console.error("Something went wrong", {cause: error});
        return false
    }
}

export const getPlaylistDifferences = async (
    playlistName: string,
    sourceClient: YoutubeMusicClientService | SpotifyService,
    targetClient: YoutubeMusicClientService | SpotifyService
): Promise<Song[] | null> => {
    try {
        const sourcePlaylist: GetPlaylistsResponse | null = await sourceClient.getPlaylistByName(playlistName);
        const targetPlaylist: GetPlaylistsResponse | null = await targetClient.getPlaylistByName(playlistName);

        if (!sourcePlaylist || !targetPlaylist) {
            console.error(`${!sourcePlaylist ? "Source playlist not found": "Source playlist found"}\n${!targetPlaylist ? "target playlist not found": "target playlist found"}`);
            return null;
        }

        const differentSongs = findDifferences(
            sourcePlaylist as any as GetPlaylistsResponse,
            targetPlaylist as any as GetPlaylistsResponse
        )

        return differentSongs;
    } catch (error) {
        console.error("Something went wrong", {cause: error});
        return null;
    }
}

export const synchronizePlaylist = async (
    playlistName: string,
    sourceClient: YoutubeMusicClientService | SpotifyService,
    targetClient: YoutubeMusicClientService | SpotifyService
): Promise<Song[] | null> => {
    try {
        let differentSongs = await getPlaylistDifferences(playlistName, sourceClient, targetClient);
        if (differentSongs) {
            return await targetClient.addSongsToPlaylist(playlistName, differentSongs);
        } else {
            return null;
        }
    } catch (error) {
        console.error("Something went wrong", {cause: error});
        return null;
    }
}

export const synchronizePlaylistWithDifferencesProvided = async (
    playlistName: string,
    sourceClient: YoutubeMusicClientService | SpotifyService,
    targetClient: YoutubeMusicClientService | SpotifyService,
    differences: Song[]
): Promise<Song[] | null> => {
    try {
        return await targetClient.addSongsToPlaylist(playlistName, differences);
    } catch (error) {
        console.error("Something went wrong", {cause: error});
        return null;
    }
}