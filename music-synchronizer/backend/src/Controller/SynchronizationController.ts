import {Request, Response} from "express";
import {
    getProposedUpdates,
    synchronizeMusicSources,
    synchronizePlaylist,
    synchronizePlaylistWithDifferencesProvided
} from "../Services/Synchronization.js";
import {AppConfig} from "../Config/AppConfig.js";
import {ProposedChanges} from "../Model/Controller.js";
import {Song} from "../Model/MusicService.js";
import {
    extractParamsFromReq,
    isSupportedService,
    PROPOSED_CHANGES_HEADER,
    PROPOSED_CHANGES_MEMORY_KEY,
    proposedChangesMemoryObjectUpdate,
    removeProposedChangeBySongIds,
    serviceTypeToClientMap,
    SupportedService,
} from "./controllerHelpers.js";
import dotenv from "dotenv";
import {InvalidRequest} from "../Errors/InvalidRequest.js";
import {handleError} from "../Errors/ErrorHandler.js";
import {Memory} from "../Util/Memory.js";
import {MemoryObjectUpdateError} from "../Errors/MemoryObjectUpdateError.js";
import {PlaylistSynchronizationError} from "../Errors/PlaylistSynchronizationError.js";
dotenv.config();

const appConfig: AppConfig = new AppConfig();
const hcpVaultService = appConfig.getHcpVaultService();

let memory = new Memory(PROPOSED_CHANGES_MEMORY_KEY)

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

        res.json({ message: `Synchronization ${response ? "Succeeded" : "Failed"}` });
    } catch (err) {
        if (err instanceof InvalidRequest) {
            res.status(400).json({
                message: `The request is missing required input parameters: ${err.message}`
            })
        }
        res.status(500).json({
            error: "Failed to synchronize playlists.",
            details: err instanceof Error ? err.message : String(err)
        });
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
        let response;
        if (req.body.proposedChangesId) {
            const proposedChanges: ProposedChanges = memory.getObjectFromMemory(PROPOSED_CHANGES_MEMORY_KEY, req.body.proposedChangesId as string, req)
            if (!proposedChanges) {
                res.status(404).json({
                    error: "Could not find differences in memory with provided request id and matching request parameters."
                });
            }
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
            throw new PlaylistSynchronizationError();
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
            const response: ProposedChanges = memory.getObjectFromMemory(PROPOSED_CHANGES_MEMORY_KEY, requestId, req)
            if (!response) {
                res.status(404).json({
                    error: "Could not find differences in memory with provided request id and matching request parameters."
                });
            }
            res.setHeader(PROPOSED_CHANGES_HEADER, requestId);
        }
        else {
            response = await getProposedUpdates(playlist, sourceClient, targetClient);
            const requestId = memory.createMemoryObject(PROPOSED_CHANGES_MEMORY_KEY, req.params, response);
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
        } = extractParamsFromReq(["proposedChangesId", "sourceSongId", "targetSongId", "operation"], req.body);

        if (proposedChangesId.trim() === "" || sourceSongId.trim() === "" || targetSongId.trim() === "" || operation.trim() === "") {
            throw new InvalidRequest(`The required body parameters are: proposedChangesId, operation, sourceSongId, targetSong`);
        }

        let didUpdatePass;
        if (operation === "update") {
            didUpdatePass = await proposedChangesMemoryObjectUpdate(
                await (serviceTypeToClientMap[targetService as SupportedService])(targetUser, hcpVaultService),
                memory.getObjectFromMemory(
                    PROPOSED_CHANGES_MEMORY_KEY,
                    proposedChangesId,
                    req
                ),
                sourceSongId,
                targetSongId
            );
        } else if (operation === "remove") {
            didUpdatePass = removeProposedChangeBySongIds(
                memory.getObjectFromMemory(
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
                memory.getObjectFromMemory(PROPOSED_CHANGES_MEMORY_KEY, proposedChangesId, req)
            );
        }
    } catch (err) {
        handleError(err, res);
    }
}