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
    PROPOSED_CHANGES_MEMORY_KEY, proposedChangesMemoryObjectUpdate,
    serviceTypeToClientMap,
    SupportedService,
} from "./controllerHelpers.js";
import dotenv from "dotenv";
import {InvalidRequest} from "../Errors/InvalidRequest.js";
import {handleError} from "../Errors/ErrorHandler.js";
import {Memory} from "../Util/Memory.js";
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
        } = extractParamsFromReq(["sourceUser", "targetUser", "sourceService", "targetService"], req)
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
        } = extractParamsFromReq(["sourceUser", "targetUser", "sourceService", "targetService", "playlist"], req);
        isSupportedService(sourceService, targetService);

        const sourceClient = await serviceTypeToClientMap[sourceService as SupportedService](sourceUser, hcpVaultService);
        const targetClient = await serviceTypeToClientMap[targetService as SupportedService](targetUser, hcpVaultService);
        let response;
        if (req.headers[PROPOSED_CHANGES_HEADER]) {
            const proposedChanges: ProposedChanges = memory.getObjectFromMemory(PROPOSED_CHANGES_MEMORY_KEY, req.headers[PROPOSED_CHANGES_HEADER] as string, req)
            if (!proposedChanges) {
                res.status(404).json({
                    error: "Could not find differences in memory with provided request id and matching request parameters."
                });
            }

            // For now let's just add songs where the changes are confident.
            const songsToAdd: Song[] = [...proposedChanges.confidentProposedChanges.map(song => song.targetSong)]
            response = await synchronizePlaylistWithDifferencesProvided(playlist, sourceClient, targetClient, songsToAdd);
        } else {
            response = await synchronizePlaylist(playlist, sourceClient, targetClient);
        }

        res.json(response ? response : "Synchronization Failed.");
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
        } = extractParamsFromReq(["sourceUser", "targetUser", "sourceService", "targetService", "playlist"], req);
        isSupportedService(sourceService, targetService);

        const sourceClient = await (serviceTypeToClientMap[sourceService as SupportedService])(sourceUser, hcpVaultService);
        const targetClient = await (serviceTypeToClientMap[targetService as SupportedService])(targetUser, hcpVaultService);
        let response;
        if (req.headers[PROPOSED_CHANGES_HEADER]) {
            const requestId = req.headers[PROPOSED_CHANGES_HEADER] as string;
            const proposedChanges: ProposedChanges = memory.getObjectFromMemory(PROPOSED_CHANGES_MEMORY_KEY, requestId, req)
            if (!proposedChanges) {
                res.status(404).json({
                    error: "Could not find differences in memory with provided request id and matching request parameters."
                });
            }
            res.setHeader(PROPOSED_CHANGES_HEADER, requestId);
            res.json(proposedChanges);
            return proposedChanges;
        }
        else {
            response = await getProposedUpdates(playlist, sourceClient, targetClient);
            const requestId = memory.createMemoryObject(PROPOSED_CHANGES_MEMORY_KEY, req.params, response);
            res.setHeader(PROPOSED_CHANGES_HEADER, requestId);
        }

        res.json(response ? response : "Failed to retrieve proposed playlist updates.");
    } catch (err) {
        handleError(err, res);
    }
}

export const updateProposedUpdatesController = async (req: Request, res: Response) => {
    try {
        let requestBody;

        if (typeof req.body === "string") {
            requestBody = JSON.parse(req.body)
        } else {
            requestBody = req.body;
        }

        const proposedChangesId = requestBody.proposedChangesId;
        const sourceSongId = requestBody.sourceSongId;
        const targetSong = requestBody.targetSong;

        if (proposedChangesId.trim() === "" || sourceSongId.trim() === "" || Object.keys(targetSong).length === 0) {
            throw new InvalidRequest(`${proposedChangesId ? "" : "Proposed changes cannot be empty "}${sourceSongId ? "" : "Source Song ID cannot be empty "}${targetSong ? "" : "Target song must be provided"}`);
        }

        const didUpdatePass = proposedChangesMemoryObjectUpdate(
            memory.getObjectFromMemory(
                PROPOSED_CHANGES_MEMORY_KEY,
                proposedChangesId,
                req
            ),
            sourceSongId,
            targetSong
        );

        res.json({
            message: `Update ${didUpdatePass ? "succeeded" : "failed"}`
        });
    } catch (err) {
        handleError(err, res);
    }
}