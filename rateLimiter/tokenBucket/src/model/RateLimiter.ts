export interface RateLimiterResponse {
    isRequestAllowed: boolean;
    waitTimeMs?: number;
}