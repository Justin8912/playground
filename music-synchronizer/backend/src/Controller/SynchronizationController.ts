import {Request, Response} from "express";
import {
    getPlaylistDifferences, getProposedUpdates,
    synchronizeMusicSources,
    synchronizePlaylist,
    synchronizePlaylistWithDifferencesProvided
} from "../Services/Synchronization.js";
import {AppConfig} from "../Config/AppConfig.js";
import {ProposedChanges} from "../Model/Controller.js";
import {Song} from "../Model/MusicService.js";
import {
    isSupportedService, PROPOSED_CHANGES_HEADER,
    PROPOSED_CHANGES_MEMORY_KEY, serviceTypeToClientMap, SupportedService, SYNCHRONIZE_DIFFERENCES_HEADER,
    SYNCHRONIZE_DIFFERENCES_MEMORY_KEY
} from "./controllerHelpers.js";
import dotenv from "dotenv";
dotenv.config();

const appConfig: AppConfig = new AppConfig();
const hcpVaultService = appConfig.getHcpVaultService();

let memory = {
    [SYNCHRONIZE_DIFFERENCES_MEMORY_KEY]: {},
    [PROPOSED_CHANGES_MEMORY_KEY]: {}
};

export const synchronizeDiscographyController = async (req: Request, res: Response) => {
    const sourceUser = req.params.sourceUser;
    const targetUser = req.params.targetUser;
    const sourceService = req.params.sourceService;
    const targetService = req.params.targetService;
    isSupportedService(sourceService, targetService)

    if (sourceUser.trim() === "" || targetUser.trim() === "") {
        res.status(400).json({ error: "Source user and target user must be non-empty." });
        return;
    }

    try {
        const sourceClient = await serviceTypeToClientMap[sourceService as SupportedService](sourceUser, hcpVaultService);
        const targetClient = await serviceTypeToClientMap[targetService as SupportedService](targetUser, hcpVaultService);
        let response = await synchronizeMusicSources(sourceClient, targetClient);

        res.json({ message: `Synchronization ${response ? "Succeeded" : "Failed"}` });
    } catch (err) {
        res.status(500).json({
            error: "Failed to synchronize playlists.",
            details: err instanceof Error ? err.message : String(err)
        });
    }
}

export const getPlaylistDifferencesController = async (req: Request, res: Response) => {
    const {
        sourceUser,
        targetUser,
        sourceService,
        targetService,
        playlist
    } = extractParamsFromReq(["sourceUser", "targetUser", "sourceService", "targetService", "playlist"], req)
    isSupportedService(sourceService, targetService)

    try {
        const sourceClient = await serviceTypeToClientMap[sourceService as SupportedService](sourceUser, hcpVaultService);
        const targetClient = await serviceTypeToClientMap[targetService as SupportedService](targetUser, hcpVaultService);
        let response = await getPlaylistDifferences(playlist, sourceClient, targetClient);

        if (response) {
            let requestId = createMemoryObject(SYNCHRONIZE_DIFFERENCES_MEMORY_KEY, req.params, response);
            res.setHeader(SYNCHRONIZE_DIFFERENCES_HEADER, requestId);
        }

        res.json(response ? response : "Synchronization Failed.");
    } catch (err) {
        res.status(500).json({
            error: "Failed to synchronize playlists.",
            details: err instanceof Error ? err.message : String(err)
        });
    }
}

export const synchronizePlaylistController = async (req: Request, res: Response) => {
    const {
        sourceUser,
        targetUser,
        sourceService,
        targetService,
        playlist
    } = extractParamsFromReq(["sourceUser", "targetUser", "sourceService", "targetService", "playlist"], req)
    isSupportedService(sourceService, targetService)

    try {
        const sourceClient = await serviceTypeToClientMap[sourceService as SupportedService](sourceUser, hcpVaultService);
        const targetClient = await serviceTypeToClientMap[targetService as SupportedService](targetUser, hcpVaultService);
        let response;
        if (req.headers[PROPOSED_CHANGES_HEADER]) {
            console.log("Using proposedChanges");
            const proposedChanges: ProposedChanges = getObjectFromMemory(PROPOSED_CHANGES_MEMORY_KEY, req.headers[PROPOSED_CHANGES_HEADER] as string, req)
            if (!proposedChanges) {
                res.status(404).json({
                    error: "Could not find differences in memory with provided request id and matching request parameters."
                });
            }

            // For now lets just add songs where the changes are confident.
            // TODO: In the future, we should add a controller that will allow modification of the "confidentProposedChanges"
            //   object and this will allow users to specifically identify which songs they want to add if the confidence
            //   score is low.
            const songsToAdd: Song[] = [...proposedChanges.confidentProposedChanges.map(song => song.targetSong)]
            response = await synchronizePlaylistWithDifferencesProvided(playlist, sourceClient, targetClient, songsToAdd);
        } else if (req.headers[SYNCHRONIZE_DIFFERENCES_HEADER]) {
            console.log("Using differences")
            const differences = getObjectFromMemory(SYNCHRONIZE_DIFFERENCES_MEMORY_KEY, req.headers[SYNCHRONIZE_DIFFERENCES_HEADER] as string, req)
            if (!differences) {
                res.status(404).json({
                    error: "Could not find differences in memory with provided request id and matching request parameters."
                });
            }
            response = await synchronizePlaylistWithDifferencesProvided(playlist, sourceClient, targetClient, differences);
        } else {
            response = await synchronizePlaylist(playlist, sourceClient, targetClient);
        }

        res.json(response ? response : "Synchronization Failed.");
    } catch (err) {
        res.status(500).json({
            error: "Failed to synchronize playlists.",
            details: err instanceof Error ? err.message : String(err)
        });
    }
}

export const getProposedUpdatesController = async (req: Request, res: Response) => {
    const {
        sourceUser,
        targetUser,
        sourceService,
        targetService,
        playlist
    } = extractParamsFromReq(["sourceUser", "targetUser", "sourceService", "targetService", "playlist"], req)
    isSupportedService(sourceService, targetService)

    try {
        const sourceClient = await serviceTypeToClientMap[sourceService as SupportedService](sourceUser, hcpVaultService);
        const targetClient = await serviceTypeToClientMap[targetService as SupportedService](targetUser, hcpVaultService);
        let response;
        if (req.headers[SYNCHRONIZE_DIFFERENCES_HEADER]) {
            const differences = getObjectFromMemory(SYNCHRONIZE_DIFFERENCES_MEMORY_KEY, req.headers[SYNCHRONIZE_DIFFERENCES_HEADER] as string, req)
            if (!differences) {
                res.status(404).json({
                    error: "Could not find differences in memory with provided request id and matching request parameters."
                });
            }
            response = await getProposedUpdates(playlist, sourceClient, targetClient, memory[SYNCHRONIZE_DIFFERENCES_MEMORY_KEY][req.headers[SYNCHRONIZE_DIFFERENCES_HEADER] as string]);
        } else {
            response = await getProposedUpdates(playlist, sourceClient, targetClient);
        }

        const requestId = createMemoryObject(PROPOSED_CHANGES_MEMORY_KEY, req.params, response);
        res.setHeader(PROPOSED_CHANGES_HEADER, requestId);
        res.json(response ? response : "Synchronization Failed.");
    } catch (err) {
        res.status(500).json({
            error: "Failed to synchronize playlists.",
            details: err instanceof Error ? err.message : String(err)
        });
    }
}

// Helper functions
const extractParamsFromReq = (requiredParams: string[], req: Request): any => {
    const res = {}
    for (const param of requiredParams) {
        const paramVal = req.params[param];
        if (paramVal?.trim() === "" || paramVal === undefined) {
            throw new Error(`Parameter ${param} is required and must be non-empty.`);
        }
        // @ts-ignore
        res[param] = paramVal
    }
    return res;
}

// The requestInputParameters should include path parameters and query parameters relevant to the request made
const getObjectFromMemory = (key: string, requestId: string, req: Request): any => {
    if (key.trim() === "" || requestId.trim() === "") {
        console.error("Cannot retrieve object from memory without key and requestId");
        return null;
    }

    const memoryObject = memory[key][requestId];

    if (!memoryObject) {
        console.log("Could not find object in memory with provided key and requestId");
        return null;
    }

    const memoryObjectRequestDetails = memoryObject.requestDetails || {};
    const requestInputParameters = {
        ...req.headers,
        ...req.query,
        ...req.params
    }

    for (const key of Object.keys(memoryObjectRequestDetails)) {
        if (requestInputParameters[key] !== memoryObjectRequestDetails[key]) {
            console.error(`requestInputParameter ${key} with value ${requestInputParameters[key]} does not match the stored requestDetails value of ${memoryObjectRequestDetails[key]}`);
            return null;
        }
    }

    return memoryObject;
}

const createMemoryObject = (key: string, requestDetails, memoryObject): string => {
    let requestId = crypto.randomUUID()
    memory[key][requestId] = memoryObject;
    memory[key][requestId].requestDetails = requestDetails;
    return requestId;
}