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
    isSupportedService,
    PROPOSED_CHANGES_HEADER,
    PROPOSED_CHANGES_MEMORY_KEY,
    serviceTypeToClientMap,
    SupportedService,
} from "./controllerHelpers.js";
import dotenv from "dotenv";
dotenv.config();

const appConfig: AppConfig = new AppConfig();
const hcpVaultService = appConfig.getHcpVaultService();

let memory = {
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
        if (req.headers[PROPOSED_CHANGES_HEADER]) {
            const requestId = req.headers[PROPOSED_CHANGES_HEADER] as string;
            const proposedChanges: ProposedChanges = getObjectFromMemory(PROPOSED_CHANGES_MEMORY_KEY, requestId, req)
            if (!proposedChanges) {
                res.status(404).json({
                    error: "Could not find differences in memory with provided request id and matching request parameters."
                });
            }
            res.setHeader(PROPOSED_CHANGES_MEMORY_KEY, requestId);
            res.json(proposedChanges);
            return proposedChanges;
        }
        else {
            response = await getProposedUpdates(playlist, sourceClient, targetClient);
            const requestId = createMemoryObject(PROPOSED_CHANGES_MEMORY_KEY, req.params, response);
            res.setHeader(PROPOSED_CHANGES_HEADER, requestId);
        }

        res.json(response ? response : "Synchronization Failed.");
    } catch (err) {
        res.status(500).json({
            error: "Failed to synchronize playlists.",
            details: err instanceof Error ? err.message : String(err)
        });
    }
}

export const updateProposedUpdatesController = async (req: Request, res: Response) => {
    console.log("Updating update proposals")
    let requestBody;
    if (typeof req.body === "string") {
        requestBody = JSON.parse(req.body)
    } else {
        requestBody = req.body;
    }

    const proposedChangesId = requestBody.proposedChangesId;
    const sourceSongId = requestBody.sourceSongId;
    const targetSong = requestBody.targetSong;

    const didUpdatePass = proposedChangesMemoryObjectUpdate(
        getObjectFromMemory(
            PROPOSED_CHANGES_MEMORY_KEY,
            proposedChangesId,
            req
        ),
        proposedChangesId,
        sourceSongId,
        targetSong
    );

    res.json({
        message: `Update ${didUpdatePass ? "succeeded" : "failed"}`
    });
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

const proposedChangesMemoryObjectUpdate = (
    proposedChanges: ProposedChanges,
    requestId: string,
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