import express, {Request, Response} from "express";
import dotenv from "dotenv";
import {defaultHandler} from "./Handlers/DefaultHandler.js";
import {AppConfig} from "./Config/AppConfig.js";
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