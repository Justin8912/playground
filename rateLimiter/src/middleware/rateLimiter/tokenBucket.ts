import {type Request} from 'express';
import type {RateLimiter, RateLimiterResponse} from "../../model/RateLimiter";

// Set environment variable RATE_LIMITER to TOKEN_BUCKET to use this implementation
export class TokenBucket implements RateLimiter {
    private readonly bucketCapacity: number;
    private readonly refillIntervalInMs: number;
    private readonly refillAmount: number;

    constructor(bucketCapacity: number, refillIntervalInMs: number, refillAmount: number) {
        this.bucketCapacity = bucketCapacity;
        this.refillIntervalInMs = refillIntervalInMs;
        this.refillAmount = refillAmount;
    }

    shouldAllowRequest(req: Request): RateLimiterResponse {
        const time = Date.now();
        const userId = req.headers?.Authorization;

        // Make the call to token bucket (redis) based on the userId

        const lastAccessed = 1764894475090;
        const currentTokens = 0;

        const currentTokensForUser = this.calculateTokens(
            lastAccessed,
            currentTokens,
            time,
            this.refillAmount,
            this.refillIntervalInMs,
            this.bucketCapacity
        );

        if (currentTokensForUser > 0) {
            // store the number of tokens and the timestamp in redis
            // storeTokens(userId, currentTokensForUser - 1, time);
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
}