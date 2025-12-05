import express, { type Express, type Request, type Response } from "express";
import {tokenBucket} from "./middleware/tokenBucket";
import {AppConfig} from "./config/AppConfig";
import { EnvironmentConfig } from "./config/EnvironmentConfig";

const app: Express = express();
const PORT = 3000;

const environmentConfig: EnvironmentConfig = new EnvironmentConfig("TOKEN_BUCKET");
const appConfig: AppConfig = new AppConfig(environmentConfig);

const rateLimiter = (req: Request, res: Response, next: () => void) => {
    console.log("Should I limit you?", req.headers?.authorization);
    const rateLimiterResponse = appConfig.getRateLimitingFunction()(req, appConfig);
    if (rateLimiterResponse.isRequestAllowed) {
        next();
    } else {
        res.status(429)
            .setHeader("x-Rate-Limited-Retry-After", String(rateLimiterResponse.waitTimeMs ?? 0)) // Probably dont want to leave this in ms since it isnt very human readable
            .setHeader("x-Rate-Limited-Bucket-Capacity", appConfig.getTokenCapacity())
            .setHeader("x-Rate-Limited-Refill-Rate", `${appConfig.getRefillRateMs() * 1000 * 60}/minute`)
            .send("Too Many Requests - Rate Limit Exceeded");
    }
}

app.use(rateLimiter);

app.get("/", (_req, res) => {
    res.send("Hello, World!");
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
