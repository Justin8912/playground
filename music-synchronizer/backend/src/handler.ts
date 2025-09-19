import express, {Request, Response} from "express";
import dotenv from "dotenv";
import {defaultHandler} from "./Handlers/DefaultHandler.js";
import {AppConfig} from "./Config/AppConfig.js";
import {synchronizeMusicSources} from "./Services/Synchronization.js";
import {getSpotifyService} from "./Services/SpotifyService.js";
import {getYoutubeMusicService} from "./Services/YoutubeMusicClientService.js";
dotenv.config();

export const app = express();
const PORT = process.env.PORT;
export const appConfig: AppConfig = new AppConfig();

app.listen(PORT, () => {
  if (!PORT) {
    throw new Error("Port is not defined. Please set the PORT in order to run this application.");
  }
  console.log(`Server listening on port ${PORT}`);
});

app.get("/", async (req: Request, res: Response) => {
  await defaultHandler(req, res);
})


export type supportedService = "spotify" | "youtube";
export const isSupportedService = (service: string): service is supportedService => {
  return ["spotify", "youtube"].includes(service);
}
const serviceTypeToClientMap = {
  "spotify": getSpotifyService,
  "youtube": getYoutubeMusicService
}
const hcpVaultService = appConfig.getHcpVaultService();

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
        let response = await synchronizeMusicSources(sourceClient, targetClient);

        res.json({ message: `Synchronization ${response ? "Succeeded" : "Failed"}` });
      } catch (err) {
        res.status(500).json({
          error: "Failed to synchronize playlists.",
          details: err instanceof Error ? err.message : String(err)
        });
      }
    })
