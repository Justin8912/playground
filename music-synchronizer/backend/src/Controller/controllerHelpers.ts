import {getSpotifyService} from "../Services/SpotifyService.js";
import {getYoutubeMusicService} from "../Services/YoutubeMusicClientService.js";

export type SupportedService = "spotify" | "youtube";
export const isSupportedService = (sourceService: string, targetService: string) => {
    if (["spotify", "youtube"].includes(sourceService) && ["spotify", "youtube"].includes(targetService)) return true;
    else throw new Error(`Unsupported service. Supported services are 'spotify' and 'youtube' received source: ${sourceService} target: ${targetService}.`);
}
export const serviceTypeToClientMap = {
    "spotify": getSpotifyService,
    "youtube": getYoutubeMusicService
}

export const SYNCHRONIZE_DIFFERENCES_HEADER = "differences-request-id";
export const SYNCHRONIZE_DIFFERENCES_MEMORY_KEY = "SYNCHRONIZE_DIFFERENCES";

export const PROPOSED_CHANGES_HEADER = "proposed-changes-id";
export const PROPOSED_CHANGES_MEMORY_KEY = "PROPOSED_CHANGES";