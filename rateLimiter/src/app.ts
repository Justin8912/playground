import express, { type Express, type Request, type Response } from "express";
import {AppConfig} from "./config/AppConfig.js";
import { EnvironmentConfig } from "./config/EnvironmentConfig.js";

const app: Express = express();
const PORT = 3000;

const environmentConfig: EnvironmentConfig = new EnvironmentConfig();
const appConfig: AppConfig = new AppConfig(environmentConfig);
await appConfig.initialize();

const rateLimiter = async (req: Request, res: Response, next: () => void) => {
    console.log("Should I limit you?", req.headers?.authorization);
    const rateLimiter = appConfig.getRateLimiter()
    const rateLimiterResponse = await rateLimiter.shouldAllowRequest(req);
    if (rateLimiterResponse.isRequestAllowed) {
        next();
    } else {
        res.status(429)
            .setHeaders(rateLimiterResponse.responseHeaders ?? new Map<string, string | number>([]))
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
