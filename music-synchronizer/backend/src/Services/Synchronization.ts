import {YoutubeMusicClientService} from "./YoutubeMusicClientService.js";
import {SpotifyService} from "./SpotifyService.js";
import {GetPlaylistsResponse, Song} from "../Model/MusicService.js";
import {findDifferences} from "../Util/findDifferences.js";
import {doSongsMatch} from "../Util/titleMatcher.js";
import {ProposedChanges} from "../Model/Controller.js";
import logger from "../Util/logger.js";

export const synchronizeMusicSources = async (
    sourceClient: YoutubeMusicClientService | SpotifyService,
    targetClient: YoutubeMusicClientService | SpotifyService
): Promise<boolean> => {
    const sourcePlaylists: GetPlaylistsResponse[] = await sourceClient.getPlaylists();

    for (const sourcePlaylist of sourcePlaylists) {
        const targetPlaylist = await targetClient.getPlaylistByName(sourcePlaylist.title)
        if (targetPlaylist) {
            await targetClient.addSongsToPlaylist(sourcePlaylist.title, sourcePlaylist.songs);
        }
    }
    return true;
}

export const getPlaylistDifferences = async (
    playlistName: string,
    sourceClient: YoutubeMusicClientService | SpotifyService,
    targetClient: YoutubeMusicClientService | SpotifyService
): Promise<Song[] | null> => {
    const sourcePlaylist: GetPlaylistsResponse | null = await sourceClient.getPlaylistByName(playlistName);
    const targetPlaylist: GetPlaylistsResponse | null = await targetClient.getPlaylistByName(playlistName);

    if (!sourcePlaylist || !targetPlaylist) {
        logger.error(`${!sourcePlaylist ? "Source playlist not found": "Source playlist found"}\n${!targetPlaylist ? "target playlist not found": "target playlist found"}`);
        return null;
    }

    const differentSongs = findDifferences(
        sourcePlaylist as any as GetPlaylistsResponse,
        targetPlaylist as any as GetPlaylistsResponse
    )

    return differentSongs;
}

export const synchronizePlaylist = async (
    playlistName: string,
    sourceClient: YoutubeMusicClientService | SpotifyService,
    targetClient: YoutubeMusicClientService | SpotifyService
): Promise<Song[] | null> => {
    let differentSongs = await getPlaylistDifferences(playlistName, sourceClient, targetClient);
    if (differentSongs) {
        return await targetClient.addSongsToPlaylist(playlistName, differentSongs);
    } else {
        return null;
    }
}

export const synchronizePlaylistWithDifferencesProvided = async (
    playlistName: string,
    targetClient: YoutubeMusicClientService | SpotifyService,
    differences: Song[]
): Promise<Song[] | null> => {
    return await targetClient.addUserApprovedSongsToPlaylist(playlistName, differences);
}

export const getProposedUpdates = async (
    playlistName: string,
    sourceClient: YoutubeMusicClientService | SpotifyService,
    targetClient: YoutubeMusicClientService | SpotifyService,
    differences?: Song[]
): Promise<ProposedChanges | null> => {
    if (!differences) {
        differences = await getPlaylistDifferences(playlistName, sourceClient, targetClient) as Song[];
    }

    let proposedChanges: ProposedChanges = {
        confidentProposedChanges: [],
        uncertainProposedChanges: []
    };
    for (const song of differences) {
        const proposedSong = await targetClient.getSong(song) as Song
        if (proposedSong) {
            if (doSongsMatch(song, proposedSong)) proposedChanges.confidentProposedChanges.push({sourceSong: song, targetSong: proposedSong});
            else {
                proposedChanges.uncertainProposedChanges.push({sourceSong: song, targetSong: proposedSong});
            }
        }
    }

    return proposedChanges;
}