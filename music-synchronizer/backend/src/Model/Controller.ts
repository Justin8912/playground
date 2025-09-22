import {Song} from "./MusicService.js";

export type ProposedChanges = {
    confidentProposedChanges: {
        sourceSong: Song,
        targetSong: Song
    }[],
    uncertainProposedChanges: {
        sourceSong: Song,
        targetSong: Song
    }[]
}