import {GetPlaylistsResponse, Song} from "../Model/MusicService.js";
import {doSongsMatch} from "./titleMatcher.js";

export const findDifferences = (
    sourcePlaylist: GetPlaylistsResponse,
    targetPlaylist: GetPlaylistsResponse
): Song[] => {
    let songsMissingFromTarget = [];
    for (const sourceSong of sourcePlaylist.songs) {
        let isSongFound = false;
        for (const targetSong of targetPlaylist.songs) {
            if (doSongsMatch(sourceSong, targetSong)) {
                isSongFound = true;
                break;
            }
        }
        if (!isSongFound) {
            songsMissingFromTarget.push(sourceSong);
        }
    }
    return songsMissingFromTarget
}