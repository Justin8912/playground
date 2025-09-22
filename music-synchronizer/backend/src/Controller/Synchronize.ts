import {Request, Response} from "express";
import {
    getPlaylistDifferences, getProposedUpdates,
    synchronizeMusicSources,
    synchronizePlaylist,
    synchronizePlaylistWithDifferencesProvided
} from "../Services/Synchronization.js";
import {getSpotifyService} from "../Services/SpotifyService.js";
import {getYoutubeMusicService} from "../Services/YoutubeMusicClientService.js";
import {AppConfig} from "../Config/AppConfig.js";
import dotenv from "dotenv";
dotenv.config();

export type SupportedService = "spotify" | "youtube";
export const isSupportedService = (sourceService: string, targetService: string) => {
    if (["spotify", "youtube"].includes(sourceService) && ["spotify", "youtube"].includes(targetService)) return true;
    else throw new Error(`Unsupported service. Supported services are 'spotify' and 'youtube' received source: ${sourceService} target: ${targetService}.`);
}
const serviceTypeToClientMap = {
    "spotify": getSpotifyService,
    "youtube": getYoutubeMusicService
}

const appConfig: AppConfig = new AppConfig();
const hcpVaultService = appConfig.getHcpVaultService();

const SYNCHRONIZE_DIFFERENCES_HEADER = "differences-request-id";
const SYNCHRONIZE_DIFFERENCES_MEMORY_KEY = "SYNCHRONIZE_DIFFERENCES";

let memory = {
    [SYNCHRONIZE_DIFFERENCES_MEMORY_KEY]: {}
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
        if (req.headers[SYNCHRONIZE_DIFFERENCES_HEADER]) {
            const differences = getObjectFromMemory(SYNCHRONIZE_DIFFERENCES_MEMORY_KEY, req.headers[SYNCHRONIZE_DIFFERENCES_HEADER] as string, req)
            if (!differences) {
                res.status(404).json({
                    error: "Could not find differences in memory with provided request id and matching request parameters."
                });
            }
            response = await synchronizePlaylistWithDifferencesProvided(playlist, sourceClient, targetClient, memory[SYNCHRONIZE_DIFFERENCES_MEMORY_KEY][req.headers[SYNCHRONIZE_DIFFERENCES_HEADER] as string]);
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