import express, {Request, Response} from "express";
import {defaultHandler} from "./Handlers/DefaultHandler.js";
import {
    synchronizeDiscographyController,
    getPlaylistDifferencesController,
    synchronizePlaylistController
} from "./Controller/Synchronize.js";

export const app = express();
const PORT = process.env.PORT;


app.listen(PORT, () => {
  if (!PORT) {
    throw new Error("Port is not defined. Please set the PORT in order to run this application.");
  }
  console.log(`Server listening on port ${PORT}`);
});

app.get("/", async (req: Request, res: Response) => {
  await defaultHandler(req, res);
})

app.get(
    "/synchronize/sourceUser/:sourceUser/targetUser/:targetUser/sourceService/:sourceService/targetService/:targetService", async (req: Request, res: Response) => {
        await synchronizeDiscographyController(req, res)
    }
)

app.get(
    "/synchronize/sourceUser/:sourceUser/targetUser/:targetUser/sourceService/:sourceService/targetService/:targetService/playlist/:playlist", async (req: Request, res: Response) => {
        await getPlaylistDifferencesController(req, res);
    }
)

app.post(
    "/synchronize/sourceUser/:sourceUser/targetUser/:targetUser/sourceService/:sourceService/targetService/:targetService/playlist/:playlist", async (req: Request, res: Response) => {
        await synchronizePlaylistController(req, res);
    }
)