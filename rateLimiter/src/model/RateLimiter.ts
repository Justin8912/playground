import {type Request} from 'express';

export interface RateLimiterResponse {
    isRequestAllowed: boolean;
    responseHeaders?: Map<string, string | number>
}

export interface RateLimiter {
    shouldAllowRequest(req: Request): Promise<RateLimiterResponse>;
    getConfigHeaders(): Map<string, string | number>
}