import {type Request} from "express";
import type {AppConfig} from "./AppConfig";
import type {RateLimiterResponse} from "../model/RateLimiter";
import {tokenBucket} from "../middleware/tokenBucket";

export class EnvironmentConfig {
    private readonly rateLimitingAlgorithm: string;

    constructor(rateLimitingAlgorithm: string) {
        this.rateLimitingAlgorithm = rateLimitingAlgorithm;
    }

    getRateLimitingFunction(): (request: Request, appConfig: AppConfig) => RateLimiterResponse {
        switch (this.rateLimitingAlgorithm) {
            case 'TOKEN_BUCKET':
                return tokenBucket;
            default:
                throw new Error(`Unsupported rate limiting algorithm: ${this.rateLimitingAlgorithm}`);
        }
    }
}