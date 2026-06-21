import type {EnvironmentConfig} from "./EnvironmentConfig.js";
import {TokenBucket} from "../middleware/rateLimiter/tokenBucket.js";
import type {RateLimiter} from "../model/RateLimiter.js";
import {createClient, type RedisClientType} from "redis";
import {LeakyBucket} from "../middleware/rateLimiter/leakyBucket.js";

export class AppConfig {
    private readonly environmentConfig: EnvironmentConfig;
    private redisClient: RedisClientType;

    constructor(environmentConfig: EnvironmentConfig) {
        this.environmentConfig = environmentConfig;
        this.redisClient = createClient({
            socket: {
                port: this.environmentConfig.getRedisPort()
            }
        });
    }

    async initialize() {
        this.redisClient.on('error', (err) => {
            throw new Error("Failed to establish connection to redis client.", {cause: err})
        });
        await this.redisClient.connect();
    }

    getRedisClient(): RedisClientType {
        return this.redisClient;
    }

    getRateLimiter(): RateLimiter {
        const rateLimitingAlgorithm = this.environmentConfig.getRateLimiterAlgorithm();
        switch (rateLimitingAlgorithm) {
            case 'TOKEN_BUCKET':
                return this.getTokenBucketRateLimiter();
            case 'LEAKY_BUCKET':
                return this.getLeakyBucketRateLimiter();
            default:
                throw new Error(`Unsupported rate limiting algorithm: ${rateLimitingAlgorithm}`);
        }
    }

    getTokenBucketRateLimiter(): TokenBucket {
        return new TokenBucket(
            this.getRedisClient(),
            this.environmentConfig.getBucketCapacity(),
            this.environmentConfig.getRefillIntervalMs(),
            this.environmentConfig.getRefillAmount()
        );
    }

    getLeakyBucketRateLimiter(): LeakyBucket {
        return new LeakyBucket(
            this.getRedisClient(),
            this.environmentConfig.getBucketCapacity(),
            this.environmentConfig.getRefillIntervalMs(),
            this.environmentConfig.getRefillAmount()
        );
    }
}