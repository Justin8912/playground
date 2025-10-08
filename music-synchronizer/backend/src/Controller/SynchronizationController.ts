import {Request, Response} from "express";
import {
    getProposedUpdates, getSongIdFromUrl,
    synchronizeMusicSources,
    synchronizePlaylistWithDifferencesProvided
} from "../Services/Synchronization.js";
import {ProposedChanges} from "../Model/Controller.js";
import {Song} from "../Model/MusicService.js";
import {
    extractParamsFromReq,
    isSupportedService,
    proposedChangesMemoryObjectUpdate,
    removeProposedChangeBySongIds,
    serviceTypeToClientMap,
    SupportedService,
} from "./controllerHelpers.js";
import {handleError} from "../Errors/ErrorHandler.js";
import {MemoryObjectUpdateError} from "../Errors/MemoryObjectUpdateError.js";
import {PlaylistSynchronizationError} from "../Errors/PlaylistSynchronizationError.js";
import {hcpVaultService, memory} from "../handler.js";
import {PROPOSED_CHANGES_HEADER, PROPOSED_CHANGES_MEMORY_KEY} from "../Util/Memory.js";

export const synchronizeDiscographyController = async (req: Request, res: Response) => {
    try {
        const {
            sourceUser,
            targetUser,
            sourceService,
            targetService
        } = extractParamsFromReq(["sourceUser", "targetUser", "sourceService", "targetService"], req.params)
        isSupportedService(sourceService, targetService);

        const sourceClient = await (serviceTypeToClientMap[sourceService as SupportedService])(sourceUser, hcpVaultService);
        const targetClient = await (serviceTypeToClientMap[targetService as SupportedService])(targetUser, hcpVaultService);
        let response = await synchronizeMusicSources(sourceClient, targetClient);

        res.json(response);
    } catch (err) {
        handleError(err, res);
    }
}

export const synchronizePlaylistController = async (req: Request, res: Response) => {
    try {
        const {
            sourceUser,
            targetUser,
            sourceService,
            targetService,
            playlist
        } = extractParamsFromReq(["sourceUser", "targetUser", "sourceService", "targetService", "playlist"], req.params);
        isSupportedService(sourceService, targetService);

        // const sourceClient = await serviceTypeToClientMap[sourceService as SupportedService](sourceUser, hcpVaultService);
        const targetClient = await serviceTypeToClientMap[targetService as SupportedService](targetUser, hcpVaultService);
        let response: Song[];
        if (req.body.proposedChangesId) {
            const proposedChanges: ProposedChanges = memory.safeGetObjectFromMemory(PROPOSED_CHANGES_MEMORY_KEY, req.body.proposedChangesId as string, req)
            const songsToAdd: Song[] = [
                ...proposedChanges.confidentProposedChanges.map(song => song.targetSong),
                ...proposedChanges.uncertainProposedChanges.map(song => song.targetSong),
            ]
            response = await synchronizePlaylistWithDifferencesProvided(playlist, targetClient, songsToAdd);
        }
        // TODO: Determine if I want to allow this endpoint to work WITHOUT a proposedChangesId. For now, I am going to
        //   leave this out so we can focus on the web application first.
        // else {
        //     response = await synchronizePlaylist(playlist, sourceClient, targetClient);
        // }

        if (!response) {
            throw new PlaylistSynchronizationError("The changesRequestId must be provided.");
        }
        res.status(200).json(response);
    } catch (err) {
        handleError(err, res);
    }
}

export const getProposedUpdatesController = async (req: Request, res: Response) => {
    try {
        const {
            sourceUser,
            targetUser,
            sourceService,
            targetService,
            playlist
        } = extractParamsFromReq(["sourceUser", "targetUser", "sourceService", "targetService", "playlist"], req.params);
        isSupportedService(sourceService, targetService);

        const sourceClient = await (serviceTypeToClientMap[sourceService as SupportedService])(sourceUser, hcpVaultService);
        const targetClient = await (serviceTypeToClientMap[targetService as SupportedService])(targetUser, hcpVaultService);
        let response;
        if (req.headers[PROPOSED_CHANGES_HEADER]) {
            const requestId = req.headers[PROPOSED_CHANGES_HEADER] as string;
            response = memory.safeGetObjectFromMemory(PROPOSED_CHANGES_MEMORY_KEY, requestId, req)
            res.setHeader(PROPOSED_CHANGES_HEADER, requestId);
        } else {
            response = await getProposedUpdates(playlist, sourceClient, targetClient);
            const requestId = memory.createMemoryObject(PROPOSED_CHANGES_MEMORY_KEY, crypto.randomUUID(), req.params, response);
            res.setHeader(PROPOSED_CHANGES_HEADER, requestId);
        }

        res.status(200).json(response);
    } catch (err) {
        handleError(err, res);
    }
}

export const updateProposedUpdatesController = async (req: Request, res: Response) => {
    try {
        const {
            targetService,
            targetUser
        } = extractParamsFromReq(["targetService", "targetUser"], req.params);

        const {
            proposedChangesId,
            sourceSongId,
            targetSongId,
            operation
        } = extractParamsFromReq(["proposedChangesId", "sourceSongId", "targetSongId", "operation"], req.body, false);

        let didUpdatePass;
        if (operation === "update") {
            let translatedSongId = targetSongId;
            if (translatedSongId.includes("https://")) translatedSongId = getSongIdFromUrl(targetSongId, targetService);
            const targetClientService = await (serviceTypeToClientMap[targetService as SupportedService])(targetUser, hcpVaultService)
            didUpdatePass = await proposedChangesMemoryObjectUpdate(
                targetClientService,
                memory.safeGetObjectFromMemory(
                    PROPOSED_CHANGES_MEMORY_KEY,
                    proposedChangesId,
                    req
                ),
                sourceSongId,
                translatedSongId
            );
        } else if (operation === "remove") {
            didUpdatePass = removeProposedChangeBySongIds(
                memory.safeGetObjectFromMemory(
                    PROPOSED_CHANGES_MEMORY_KEY,
                    proposedChangesId,
                    req
                ),
                sourceSongId,
                targetSongId
            );
        }

        if (!didUpdatePass) {
            throw new MemoryObjectUpdateError();
        } else {
            res.status(200).json(
                memory.safeGetObjectFromMemory(PROPOSED_CHANGES_MEMORY_KEY, proposedChangesId, req)
            );
        }
    } catch (err) {
        handleError(err, res);
    }
}