import type {EnvironmentConfig} from "./EnvironmentConfig";
import {TokenBucket} from "../middleware/rateLimiter/tokenBucket";
import type {RateLimiter} from "../model/RateLimiter";

export class AppConfig {
    private readonly environmentConfig: EnvironmentConfig;

    constructor(environmentConfig: EnvironmentConfig) {
        this.environmentConfig = environmentConfig;
    }

    async initialize() {}

    getRateLimiter(): RateLimiter {
        const rateLimitingAlgorithm = this.environmentConfig.getRateLimiterAlgorithm();
        switch (rateLimitingAlgorithm) {
            case 'TOKEN_BUCKET':
                return this.getTokenBucketRateLimiter();
            default:
                throw new Error(`Unsupported rate limiting algorithm: ${rateLimitingAlgorithm}`);
        }
    }

    getTokenBucketRateLimiter(): TokenBucket {
        return new TokenBucket(
            this.environmentConfig.getBucketCapacity(),
            this.environmentConfig.getRefillIntervalMs(),
            this.environmentConfig.getRefillAmount()
        );
    }

    getRefillRateMs(): number {
        // TODO: this will need to be refactored when non bucket based algorithms are supported
        return this.environmentConfig.getRefillAmount() / this.environmentConfig.getRefillIntervalMs();
    }
}