import {YoutubeMusicClientService} from "./YoutubeMusicClientService.js";
import {SpotifyService} from "./SpotifyService.js";
import {GetPlaylistsResponse, Song} from "../Model/MusicService.js";
import {findDifferences} from "../Util/findDifferences.js";
import {doSongsMatch} from "../Util/titleMatcher.js";
import {ProposedChanges, SongMapping, SynchronizeMusicSources} from "../Model/Controller.js";
import logger from "../Util/logger.js";
import {PlaylistNotFoundError} from "../Errors/PlaylistNotFoundError.js";



export const synchronizeMusicSources = async (
    sourceClient: YoutubeMusicClientService | SpotifyService,
    targetClient: YoutubeMusicClientService | SpotifyService
): Promise<SynchronizeMusicSources> => {
    let response: SynchronizeMusicSources =  {};
    const sourcePlaylists: GetPlaylistsResponse[] = await sourceClient.getPlaylists();

    for (const sourcePlaylist of sourcePlaylists) {
        const proposedUpdates: ProposedChanges = await getProposedUpdates(sourcePlaylist.title, sourceClient, targetClient);

        // @ts-ignore
        response[sourcePlaylist.title] = {}
        if (proposedUpdates) {
            const failedSongAdds = await targetClient.addUserApprovedSongsToPlaylist(
                sourcePlaylist.title,
                proposedUpdates.confidentProposedChanges.map(mapping => mapping.targetSong)
            );

            // @ts-ignore
            response[sourcePlaylist.title] = {
                failedSongs: failedSongAdds,
                unconfidentSongs: proposedUpdates.uncertainProposedChanges
            }
        }
    }
    return response;
}

export const getPlaylistDifferences = async (
    playlistName: string,
    sourceClient: YoutubeMusicClientService | SpotifyService,
    targetClient: YoutubeMusicClientService | SpotifyService
): Promise<Song[] | null> => {
    const sourcePlaylist: GetPlaylistsResponse | null = await sourceClient.getPlaylistByName(playlistName);
    const targetPlaylist: GetPlaylistsResponse | null = await targetClient.getPlaylistByName(playlistName);

    if (!sourcePlaylist || !targetPlaylist) {
        throw new PlaylistNotFoundError(`${playlistName}: ${!sourcePlaylist ? "Source playlist not found": ""}\n${!targetPlaylist ? "target playlist not found": ""}`)
    }

    const differentSongs = findDifferences(
        sourcePlaylist as any as GetPlaylistsResponse,
        targetPlaylist as any as GetPlaylistsResponse
    )

    return differentSongs;
}

export const synchronizePlaylistWithDifferencesProvided = async (
    playlistName: string,
    targetClient: YoutubeMusicClientService | SpotifyService,
    songsToAdd: Song[]
): Promise<Song[] | null> => {
    return await targetClient.addUserApprovedSongsToPlaylist(playlistName, songsToAdd);
}

export const getProposedUpdates = async (
    playlistName: string,
    sourceClient: YoutubeMusicClientService | SpotifyService,
    targetClient: YoutubeMusicClientService | SpotifyService,
    differences?: Song[]
): Promise<ProposedChanges> => {
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