import express, {Request, Response} from "express";
import cors from "cors";
import {
    synchronizeDiscographyController,
    synchronizePlaylistController,
    getProposedUpdatesController,
    updateProposedUpdatesController
} from "./Controller/SynchronizationController.js";
import {dummy, dummyMemoryObject} from "./Controller/dummy.js";
import {getAuthorizationUriController, handleRedirectController} from "./Controller/authorization.js";
import {AppConfig} from "./Config/AppConfig.js";
import {Memory, PROPOSED_CHANGES_HEADER, PROPOSED_CHANGES_MEMORY_KEY} from "./Util/Memory.js";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;
export const app = express();
export const appConfig: AppConfig = new AppConfig();
await appConfig.initialize();

export const hcpVaultService = appConfig.getHcpVaultService();
export const memory = new Memory()

// TODO: Remove me:
memory.injectMemoryObject(PROPOSED_CHANGES_MEMORY_KEY, "test", JSON.parse(dummyMemoryObject))

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Origin", PROPOSED_CHANGES_HEADER],
    exposedHeaders: [PROPOSED_CHANGES_HEADER]
}));
app.use(express.json());

app.listen(PORT, () => {
  if (!PORT) {
    throw new Error("Port is not defined. Please set the PORT in order to run this application.");
  }
  console.log(`Server listening on port ${PORT}`);
});

app.get(
    "/synchronize/sourceUser/:sourceUser/targetUser/:targetUser/sourceService/:sourceService/targetService/:targetService", async (req: Request, res: Response) => {
        await synchronizeDiscographyController(req, res)
    }
)

app.post(
    "/synchronize/sourceUser/:sourceUser/targetUser/:targetUser/sourceService/:sourceService/targetService/:targetService/playlist/:playlist", async (req: Request, res: Response) => {
        await synchronizePlaylistController(req, res);
    }
)

app.get(
    "/updates/sourceUser/:sourceUser/targetUser/:targetUser/sourceService/:sourceService/targetService/:targetService/playlist/:playlist", async (req: Request, res: Response) => {
        // NOTE: differences generated here are actually just additive changes. So if the target service does not have a
        // song that the source service has, it will be added to the differences list.
        await getProposedUpdatesController(req, res);
    }
)

app.post("/updates/sourceUser/:sourceUser/targetUser/:targetUser/sourceService/:sourceService/targetService/:targetService/playlist/:playlist", async (req: Request, res: Response) => {
    await updateProposedUpdatesController(req, res);
})

app.get("/authorize/user/:user/service/:service", async (req, res) => {
    await getAuthorizationUriController(req, res);
})

app.get("/authorize/service/:service/redirect", async (req, res) => {
    await handleRedirectController(req, res);
})