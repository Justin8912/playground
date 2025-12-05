import type {EnvironmentConfig} from "./EnvironmentConfig";
import {tokenBucket} from "../middleware/tokenBucket";
import type {Request} from "express";
import type {RateLimiterResponse} from "../model/RateLimiter";

export class AppConfig {
    private readonly environmentConfig: EnvironmentConfig;

    constructor(environmentConfig: EnvironmentConfig) {
        this.environmentConfig = environmentConfig;
    }

    async initialize() {}

    getRateLimitingFunction(): (request: Request, appConfig: AppConfig) => RateLimiterResponse {
        const rateLimitingAlgorithm = this.environmentConfig.getRateLimitingFunction();
        switch (rateLimitingAlgorithm) {
            case 'TOKEN_BUCKET':
                return tokenBucket;
            default:
                throw new Error(`Unsupported rate limiting algorithm: ${rateLimitingAlgorithm}`);
        }
    }

    getBucketCapacity(): number {
        return this.environmentConfig.getBucketCapacity();
    }

    getRefillAmount(): number {
        return this.environmentConfig.getRefillAmount();
    }

    getRefillIntervalMs(): number {
        return this.environmentConfig.getRefillIntervalMs();
    }

    getRefillRateMs(): number {
        return this.getRefillAmount() / this.getRefillIntervalMs();
    }
}