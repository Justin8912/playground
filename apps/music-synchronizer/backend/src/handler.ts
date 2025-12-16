import express, {NextFunction, Request, Response} from "express";
import cors from "cors";
import {
    synchronizePlaylistController,
    getProposedUpdatesController,
    updateProposedUpdatesController
} from "./Controller/SynchronizationController.js";
import {getAuthorizationUriController, handleRedirectController} from "./Controller/authorization.js";
import {AppConfig} from "./Config/AppConfig.js";
import {Memory, PROPOSED_CHANGES_HEADER} from "./Util/Memory.js";
import dotenv from "dotenv";
import {handleError} from "./Errors/ErrorHandler.js";
dotenv.config();

const PORT = process.env.PORT;
export const app = express();
export const appConfig: AppConfig = new AppConfig();
await appConfig.initialize();

export const hcpVaultService = appConfig.getHcpVaultService();
export const memory = new Memory()

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

app.post("/synchronize/sourceUser/:sourceUser/targetUser/:targetUser/sourceService/:sourceService/targetService/:targetService/playlist/:playlist", async (req: Request, res: Response, next: NextFunction) => {
    try {
        await synchronizePlaylistController(req, res);
    } catch (err) {
        next(err);
    }
})

app.get("/updates/sourceUser/:sourceUser/targetUser/:targetUser/sourceService/:sourceService/targetService/:targetService/playlist/:playlist", async (req: Request, res: Response, next: NextFunction) => {
        // NOTE: differences generated here are actually just additive changes. So if the target service does not have a
        // song that the source service has, it will be added to the differences list.
    try {
        await getProposedUpdatesController(req, res);
    } catch (err) {
        next(err);
    }
})

app.post("/updates/sourceUser/:sourceUser/targetUser/:targetUser/sourceService/:sourceService/targetService/:targetService/playlist/:playlist", async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateProposedUpdatesController(req, res);
    } catch (err) {
        next(err);
    }
})

app.get("/authorize/user/:user/service/:service", async (req, res, next: NextFunction) => {
    try{
        await getAuthorizationUriController(req, res);
    } catch (err) {
        next(err);
    }
})

app.get("/authorize/service/:service/redirect", async (req, res, next: NextFunction) => {
    try{
        await handleRedirectController(req, res);
    } catch (err) {
        next(err);
    }
})

app.use((error, req, res, next) => {handleError(error, res)});