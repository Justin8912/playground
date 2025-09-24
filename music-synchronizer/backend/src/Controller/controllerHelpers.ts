import {getSpotifyService, SpotifyService} from "../Services/SpotifyService.js";
import {getYoutubeMusicService, YoutubeMusicClientService} from "../Services/YoutubeMusicClientService.js";
import {Request} from "express";
import {InvalidRequest} from "../Errors/InvalidRequest.js";
import {ProposedChanges} from "../Model/Controller.js";
import {Song} from "../Model/MusicService.js";

export type SupportedService = "spotify" | "youtube";
export const isSupportedService = (sourceService: string, targetService: string) => {
    if (["spotify", "youtube"].includes(sourceService) && ["spotify", "youtube"].includes(targetService)) return true;
    else throw new Error(`Unsupported service. Supported services are 'spotify' and 'youtube' received source: ${sourceService} target: ${targetService}.`);
}
export const serviceTypeToClientMap = {
    "spotify": getSpotifyService,
    "youtube": getYoutubeMusicService
}

export const PROPOSED_CHANGES_HEADER = "proposed-changes-id";
export const PROPOSED_CHANGES_MEMORY_KEY = "PROPOSED_CHANGES";

export const extractParamsFromReq = (requiredParams: string[], req: Request): any => {
    const res = {}
    for (const param of requiredParams) {
        const paramVal = req.params[param];
        if (paramVal?.trim() === "" || paramVal === undefined) {
            throw new InvalidRequest(`Parameter ${param} is required and must be non-empty.`);
        }
        // @ts-ignore
        res[param] = paramVal.toLowerCase()
    }
    return res;
}

export const proposedChangesMemoryObjectUpdate = async (
    targetClient: SpotifyService | YoutubeMusicClientService,
    proposedChanges: ProposedChanges,
    sourceSongId: string,
    targetSongId: string
): Promise<boolean> => {
    const targetSong: Song | null = await targetClient.getSongById(targetSongId);
    if (!proposedChanges) return false;
    if (!targetSong) return false;

    const updateInArray = (arr: { sourceSong: Song; targetSong: Song }[]) => {
        let hasMadeUpdate = false;
        for (const obj of arr) {
            if (obj.sourceSong.videoId === sourceSongId) {
                Object.assign(obj.targetSong, targetSong);
                hasMadeUpdate = true;
            }
        }
        return hasMadeUpdate
    };

    return (
        updateInArray(proposedChanges.confidentProposedChanges) ||
        updateInArray(proposedChanges.uncertainProposedChanges)
    );

}

export const removeProposedChangeBySongIds = (
    memoryObject: ProposedChanges,
    sourceSongId: string,
    targetSongId: string
): boolean => {
    if (!memoryObject) return false;
    const removeFromArray = (arr: any[]) => {
        const idx = arr.findIndex(
            (change) =>
                change.sourceSong?.videoId === sourceSongId &&
                change.targetSong?.videoId === targetSongId
        );
        if (idx !== -1) {
            arr.splice(idx, 1);
            return true;
        }
        return false;
    };
    if (Array.isArray(memoryObject.confidentProposedChanges) && removeFromArray(memoryObject.confidentProposedChanges)) {
        return true;
    }
    if (Array.isArray(memoryObject.uncertainProposedChanges) && removeFromArray(memoryObject.uncertainProposedChanges)) {
        return true;
    }
    return false;
}