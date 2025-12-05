import {type Request} from 'express';
import type {RateLimiter, RateLimiterResponse} from "../../model/RateLimiter.js";
import type {RedisClientType} from "redis";

// Set environment variable RATE_LIMITER to TOKEN_BUCKET to use this implementation
export class TokenBucket implements RateLimiter {
    private readonly redisClient: RedisClientType;
    private readonly bucketCapacity: number;
    private readonly refillIntervalInMs: number;
    private readonly refillAmount: number;

    constructor(redisClient: RedisClientType, bucketCapacity: number, refillIntervalInMs: number, refillAmount: number) {
        this.redisClient = redisClient;
        this.bucketCapacity = bucketCapacity;
        this.refillIntervalInMs = refillIntervalInMs;
        this.refillAmount = refillAmount;
    }

    async shouldAllowRequest(req: Request): Promise<RateLimiterResponse> {
        const time = Date.now();
        const userId = req.headers.authorization as string;

        if (!userId) {
            throw new Error("User ID must be specified in the request");
        }

        // Make the call to token bucket (redis) based on the userId
        const {lastAccessed, currentTokens} = await this.getCurrentTokensForUser(userId as string);

        const currentTokensForUser = this.calculateTokens(
            lastAccessed,
            currentTokens,
            time,
            this.refillAmount,
            this.refillIntervalInMs,
            this.bucketCapacity
        );

        if (currentTokensForUser > 0) {
            await this.updateUserTokens(userId, currentTokensForUser - 1, time);
            return { isRequestAllowed: true }
        } else {
            return {
                isRequestAllowed: false,
                responseHeaders:
                    this.getConfigHeaders()
                        .set('x-Rate-Limiter-Retry-After', this.calculateWaitTime(
                            lastAccessed,
                            time,
                            this.refillAmount,
                            this.refillIntervalInMs
                        ))
            };
        }
    }

    getConfigHeaders(): Map<string, string | number> {
        return new Map<string, string | number>([
            ["x-Rate-Limited-Bucket-Capacity", this.bucketCapacity],
            ["x-Rate-Limited-Refill-Rate", `${(this.refillAmount / this.refillIntervalInMs) * 1000 * 60}/minute`]
        ]);
    }

    private calculateTokens (
        lastAccessed: number,
        currentTokens: number,
        currentTime: number,
        refillAmount: number,
        refillIntervalInMs: number,
        tokenCapacity: number
    ): number {
        const timeElapsed = currentTime - lastAccessed;
        const tokensToAdd = Math.floor((timeElapsed / (refillIntervalInMs)) * refillAmount);
        return Math.min(currentTokens + tokensToAdd, tokenCapacity);
    }

    private calculateWaitTime (
        lastAccessed: number,
        currentTime: number,
        refillAmount: number,
        refillIntervalInMs: number
    ): number {
        return ((refillIntervalInMs / refillAmount) - (currentTime - lastAccessed));
    }

    private async getCurrentTokensForUser(userId: string): Promise<{
        lastAccessed: number,
        currentTokens: number
    }> {
        type TokenBucketEntry = {
            tokens: string,
            lastAccessed: string
        }
        const entry = (await this.redisClient.hGetAll(userId)) as unknown as TokenBucketEntry;

        if (!entry.lastAccessed) {
            await this.redisClient.hSet(userId, { tokens: String(this.bucketCapacity), lastAccessed: String(Date.now()) });
            return {
                lastAccessed: Date.now(),
                currentTokens: this.bucketCapacity
            };
        } else {
            return {
                lastAccessed: parseInt(entry.lastAccessed),
                currentTokens: parseInt(entry.tokens)
            }
        }
    }

    private async updateUserTokens(userId: string, tokens: number, timestamp: number): Promise<void> {
        await this.redisClient.hSet(userId, { tokens: String(tokens), lastAccessed: String(timestamp) });
    }
}