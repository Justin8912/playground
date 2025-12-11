import configuration from "./configuration.json";

const RATE_LIMITER_ENVIRONMENT_VARIABLE = "RATE_LIMITER";
export class EnvironmentConfig {
    private readonly configuration: any;

    constructor() {
        this.configuration = configuration;
    }

    getRateLimiterAlgorithm(): string {
        return this.configuration.rateLimiterAlgorithm;
    }

    getEnvironmentVariable(variableName: string): string {
        const envVar = process.env[variableName];
        if (!envVar) {
            throw new Error(`Environment variable ${variableName} not set.`);
        }
        return envVar;
    }

    getRedisPort(): number {
        return this.configuration.redisPort;
    }

    // Rate Limiting Algorithm Variables
    getRefillIntervalMs(): number {
        return this.configuration.refillIntervalMs;
    }

    getRefillAmount(): number {
        return this.configuration.refillAmount;
    }

    getBucketCapacity(): number {
        return this.configuration.bucketCapacity;
    }
}