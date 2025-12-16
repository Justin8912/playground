import {Song} from "./MusicService.js";

export type ProposedChanges = {
    confidentProposedChanges: SongMapping[],
    uncertainProposedChanges: SongMapping[]
}

export type SongMapping = {
    sourceSong: Song,
    targetSong: Song
}

export type SynchronizeMusicSources = {
    [key: string]: {
        failedSongs: Song[],
        unconfidentSongs: SongMapping[]
    }
}