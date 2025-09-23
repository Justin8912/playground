import {getSpotifyService} from "../Services/SpotifyService.js";
import {getYoutubeMusicService} from "../Services/YoutubeMusicClientService.js";
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
        res[param] = paramVal
    }
    return res;
}

export const proposedChangesMemoryObjectUpdate = (
    proposedChanges: ProposedChanges,
    sourceSongId: string,
    targetSong: Song
): boolean => {
    if (!proposedChanges) return false;

    const updateInArray = (arr: { sourceSong: Song; targetSong: Song }[]) => {
        for (const obj of arr) {
            if (obj.sourceSong.videoId === sourceSongId) {
                Object.assign(obj.targetSong, targetSong);
                return true;
            }
        }
        return false;
    };

    return (
        updateInArray(proposedChanges.confidentProposedChanges) ||
        updateInArray(proposedChanges.uncertainProposedChanges)
    );
}