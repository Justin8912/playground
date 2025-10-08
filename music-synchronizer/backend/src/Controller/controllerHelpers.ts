import {getSpotifyService, SpotifyService} from "../Services/SpotifyService.js";
import {getYoutubeMusicService, YoutubeMusicClientService} from "../Services/YoutubeMusicClientService.js";
import {InvalidRequest} from "../Errors/InvalidRequest.js";
import {ProposedChanges} from "../Model/Controller.js";
import {Song} from "../Model/MusicService.js";
import {SongRetrievalError} from "../Errors/SongRetrievalError.js";

export type SupportedService = "spotify" | "youtube";
export const isSupportedService = (sourceService: string, targetService: string) => {
    if (["spotify", "youtube"].includes(sourceService) && ["spotify", "youtube"].includes(targetService)) return true;
    else throw new InvalidRequest(`Unsupported service. Supported services are 'spotify' and 'youtube' received source: ${sourceService} target: ${targetService}.`);
}
export const serviceTypeToClientMap = {
    "spotify": getSpotifyService,
    "youtube": getYoutubeMusicService
}

export const extractParamsFromReq = (requiredParams: string[], req: any, shouldConvertToLowerCase: boolean = true): any => {
    const res: {[index: string]: any} = {}
    for (const param of requiredParams) {
        const paramVal = req[param];
        if (paramVal?.trim() === "" || paramVal === undefined) {
            throw new InvalidRequest(`Parameter ${param} is required and must be non-empty.`);
        }

        if (shouldConvertToLowerCase) res[param] = paramVal.toLowerCase()
        else res[param] = paramVal;
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
    if (!proposedChanges) throw new InvalidRequest(`No proposed changes provided. Check request and ensure that the proposed changes id is correct.`);
    if (!targetSong) throw new SongRetrievalError(`Could not find song with id ${targetSongId} using ${targetClient.constructor.name}`);

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
    if (!memoryObject) throw new InvalidRequest(`No proposed changes provided. Check request and ensure that the proposed changes id is correct.`);
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
    return Array.isArray(memoryObject.uncertainProposedChanges) && removeFromArray(memoryObject.uncertainProposedChanges);
}