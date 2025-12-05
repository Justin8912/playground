import configuration from "./configuration.json";

const RATE_LIMITER_ENVIRONMENT_VARIABLE = "RATE_LIMITER";
export class EnvironmentConfig {
    private readonly configuration: any;

    constructor() {
        this.configuration = configuration;
    }

    getRefillIntervalMs(): number {
        return this.configuration.refillIntervalMs;
    }

    getRefillAmount(): number {
        return this.configuration.refillAmount;
    }

    getBucketCapacity(): number {
        return this.configuration.bucketCapacity;
    }

    getRateLimiterAlgorithm(): string {
        return this.getEnvironmentVariable(RATE_LIMITER_ENVIRONMENT_VARIABLE);
    }

    getEnvironmentVariable(variableName: string): string {
        const envVar = process.env[variableName];
        if (!envVar) {
            throw new Error(`Environment variable ${variableName} not set.`);
        }
        return envVar;
    }
}