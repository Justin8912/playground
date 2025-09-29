import express, {Request, Response} from "express";
import cors from "cors";
import {
    synchronizeDiscographyController,
    synchronizePlaylistController, getProposedUpdatesController, updateProposedUpdatesController
} from "./Controller/SynchronizationController.js";
import {PROPOSED_CHANGES_HEADER} from "./Controller/controllerHelpers.js";
import {dummy} from "./Controller/dummy.js";

export const app = express();
const PORT = process.env.PORT;

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

app.get("/", async (req: Request, res: Response) => {
  await dummy(req, res);
})

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
