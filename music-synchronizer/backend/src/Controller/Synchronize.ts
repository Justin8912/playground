import {getPlaylistDifferences, synchronizeMusicSources, synchronizePlaylist} from "../Services/Synchronization.js";
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

export const synchronizeDiscographyController = async (req, res) => {
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

export const getPlaylistDifferencesController = async (req, res) => {
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

        res.json(response ? response : "Synchronization Failed.");
    } catch (err) {
        res.status(500).json({
            error: "Failed to synchronize playlists.",
            details: err instanceof Error ? err.message : String(err)
        });
    }
}

export const synchronizePlaylistController = async (req, res) => {
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
        let response = await synchronizePlaylist(playlist, sourceClient, targetClient);

        res.json(response ? response : "Synchronization Failed.");
    } catch (err) {
        res.status(500).json({
            error: "Failed to synchronize playlists.",
            details: err instanceof Error ? err.message : String(err)
        });
    }
}

const extractParamsFromReq = (requiredParams: string[], req): any => {
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