import type {RedisClientType} from "redis";
import {type Request} from 'express';
import type {RateLimiter, RateLimiterResponse} from "../../model/RateLimiter.js";

export class LeakyBucket implements RateLimiter {
    private redisClient: RedisClientType;
    private readonly bucketCapacity: number;
    private readonly refillIntervalInMs: number;
    private readonly refillAmount: number;

    constructor(
        redisClient: RedisClientType,
        bucketCapacity: number,
        refillIntervalInMs: number,
        refillAmount: number
    ) {
        this.redisClient = redisClient;
        this.bucketCapacity = bucketCapacity;
        this.refillIntervalInMs = refillIntervalInMs;
        this.refillAmount = refillAmount;
    }

    async shouldAllowRequest(req: Request): Promise<RateLimiterResponse> {
        const time = Date.now();
        const userId = req.headers?.authorization as string;

        if (!userId) {
            throw new Error("User ID must be specified in the request");
        }

        const timestamps = await this.getTimestampsFromRedis(userId);
        const updatedTimestampsArray = this.calculateAccessedTimestampsArray(time, timestamps);

        if (updatedTimestampsArray.length < this.bucketCapacity) {
            await this.updateTimestampsInRedis(userId, [ ...updatedTimestampsArray, time ]);
            return { isRequestAllowed: true };
        } else {
            return {
                isRequestAllowed: false,
                responseHeaders: this.getConfigHeaders().set(
                    'x-Rate-Limiter-Retry-After',  ((this.refillIntervalInMs / this.refillAmount) - (time - Math.min(...updatedTimestampsArray)))
                )
            };
        }
    }

    async getTimestampsFromRedis(userId: string): Promise<number[]> {
        const redisResponse = await this.redisClient.hGetAll(this.getRedisId(userId));
        if (!redisResponse?.accessedTimestamps) {
            const timestamps = [ Date.now() ]
            await this.updateTimestampsInRedis(userId, timestamps)
            return timestamps;
        }

        return redisResponse?.accessedTimestamps?.split(',')
            .map(ts=>parseInt(ts));
    }

    async updateTimestampsInRedis(userId: string, timestamps: number[]): Promise<void> {
        await this.redisClient.hSet(this.getRedisId(userId), { accessedTimestamps: String(timestamps) })
    }

    calculateAccessedTimestampsArray(time: number, timestamps: number[]) {
        const outsideInterval = time - this.refillIntervalInMs;
        return timestamps.filter((timestamp) => timestamp > outsideInterval);
    }

    private getRedisId(userId: string): string {
        return `${userId}:LEAKY_BUCKET`
    }

    getConfigHeaders(): Map<string, string | number> {
        return new Map<string, string | number>([
            ["x-Rate-Limited-Bucket-Capacity", this.bucketCapacity],
            ["x-Rate-Limited-Refill-Rate", `${(this.refillAmount / this.refillIntervalInMs) * 1000 * 60}/minute`]
        ]);
    }
}