import {type Request} from 'express';
import type {AppConfig} from "../config/AppConfig";
import type {RateLimiterResponse} from "../model/RateLimiter";

export const tokenBucket = (req: Request, appConfig: AppConfig): RateLimiterResponse => {
    const time = Date.now();
    const userId = req.headers?.Authorization;

    // Make the call to token bucket (redis) based on the userId

    const lastAccessed = 1764894475090;
    const currentTokens = 0;

    const currentTokensForUser = calculateTokens(
        lastAccessed,
        currentTokens,
        time,
        appConfig.getRefillAmount(),
        appConfig.getRefillIntervalMs(),
        appConfig.getBucketCapacity()
    );

    console.log(currentTokensForUser)
    if (currentTokensForUser > 0) {
        // store the number of tokens and the timestamp in redis
        // storeTokens(userId, currentTokensForUser - 1, time);
        return { isRequestAllowed: true }
    } else {
        return {
            isRequestAllowed: false,
            waitTimeMs: calculateWaitTime(
                lastAccessed,
                time,
                appConfig.getRefillAmount(),
                appConfig.getRefillIntervalMs()
            )
        };
    }
}

const calculateTokens = (
    lastAccessed: number,
    currentTokens: number,
    currentTime: number,
    refillAmount: number,
    refillIntervalInMs: number,
    tokenCapacity: number
): number => {
    const timeElapsed = currentTime - lastAccessed;
    const tokensToAdd = Math.floor((timeElapsed / (refillIntervalInMs)) * refillAmount);
    return Math.min(currentTokens + tokensToAdd, tokenCapacity);
}

const calculateWaitTime = (
    lastAccessed: number,
    currentTime: number,
    refillAmount: number,
    refillIntervalInMs: number
): number => {
    console.log("ms per token: ", refillIntervalInMs / refillAmount);
    console.log("Current time discrepancy: ", currentTime - lastAccessed);
    return ((refillIntervalInMs / refillAmount) - (currentTime - lastAccessed));
}