import configuration from "./configuration.json";

export class EnvironmentConfig {
    private readonly rateLimitingAlgorithm: string;
    private readonly configuration: any;

    constructor(rateLimitingAlgorithm: string) {
        this.rateLimitingAlgorithm = rateLimitingAlgorithm;
        this.configuration = configuration;
    }

    getRateLimitingFunction(): string {
        return this.rateLimitingAlgorithm;
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
}