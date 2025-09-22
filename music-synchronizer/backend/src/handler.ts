import express, {Request, Response} from "express";
import {
    synchronizeDiscographyController,
    getPlaylistDifferencesController,
    synchronizePlaylistController, getProposedUpdatesController
} from "./Controller/SynchronizationController.js";

export const app = express();
const PORT = process.env.PORT;


app.listen(PORT, () => {
  if (!PORT) {
    throw new Error("Port is not defined. Please set the PORT in order to run this application.");
  }
  console.log(`Server listening on port ${PORT}`);
});

app.get("/", async (req: Request, res: Response) => {
  res.json({
      response: "Server is up and running."
  })
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