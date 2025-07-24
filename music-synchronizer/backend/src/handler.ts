import express, {Request, Response} from "express";
import dotenv from "dotenv";
import {defaultHandler} from "./Handlers/DefaultHandler.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

// app.get("/", (req: Request, res: Response) => {
//   res.json({ message: "API is running" });
// });

app.listen(PORT, () => {
  if (!PORT) {
    throw new Error("Port is not defined. Please set the PORT in order to run this application.");
  }
  console.log(`Server listening on port ${PORT}`);
});

app.get("/", async (req: Request, res: Response) => {
  await defaultHandler(req, res);
})