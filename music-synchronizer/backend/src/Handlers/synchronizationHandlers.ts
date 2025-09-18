import {app} from "../handler.js";
import {appConfig} from "../handler.js";
import express, {Request, Response} from "express";
import {getYoutubeMusicService} from "../Services/YoutubeMusicClientService.js";
import {getSpotifyService} from "../Services/SpotifyService.js";

export type supportedService = "spotify" | "youtube";
export const isSupportedService = (service: string): service is supportedService => {
    return ["spotify", "youtube"].includes(service);
}
const serviceTypeToClientMap = {
    "spotify": getSpotifyService,
    "youtube": getYoutubeMusicService
}
const hcpVaultService = appConfig.getHcpVaultService();

// GET /synchronize/sourceUser/:sourceUser/targetUser/:targetUser/sourceService/:sourceService/targetService/:targetService
app.get(
    "/synchronize/sourceUser/:sourceUser/targetUser/:targetUser/sourceService/:sourceService/targetService/:targetService",
    async (req: Request, res: Response) => {
    console.log(req);

    // validate inputs
    const sourceUser = req.params.sourceUser;
    const targetUser = req.params.targetUser;
    const sourceService = req.params.sourceService;
    const targetService = req.params.targetService;
    if (!isSupportedService(sourceService) || !isSupportedService(targetService)) {
        res.status(400).json({ error: "Unsupported service. Supported services are 'spotify' and 'youtube'." });
        return;
    }

    if (sourceUser.trim() === "" || targetUser.trim() === "") {
        res.status(400).json({ error: "Source user and target user must be non-empty." });
        return;
    }

    // synchronize playlists from source user and source service to target user and target service
    try {
        // get source service client
        const sourceClient = await serviceTypeToClientMap[sourceService](sourceUser, hcpVaultService);
        // get target service client
        const targetClient = await serviceTypeToClientMap[targetService](targetUser, hcpVaultService);
        // perform action

        res.json({ message: "Synchronization completed successfully." });
    } catch (err) {
        res.status(500).json({
            error: "Failed to synchronize playlists.",
            details: err instanceof Error ? err.message : String(err)
        });
    }
})
