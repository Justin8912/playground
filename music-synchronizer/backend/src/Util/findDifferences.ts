import {GetPlaylistsResponse, Song} from "../Model/MusicService.js";
import {isSongMatch} from "./titleMatcher.js";

export const findDifferences = (
    sourcePlaylist: GetPlaylistsResponse,
    targetPlaylist: GetPlaylistsResponse
): Song[] => {
    let songsMissingFromTarget = [];
    for (const sourceSong of sourcePlaylist.songs) {
        let isSongFound = false;
        for (const targetSong of targetPlaylist.songs) {
            if (isSongMatch(
                {title: sourceSong.title, artist: sourceSong.artists.join(" ")},
                {title: targetSong.title, artist: targetSong.artists.join(" ")}
            )) {
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