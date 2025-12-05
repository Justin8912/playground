import type {EnvironmentConfig} from "./EnvironmentConfig";

export class AppConfig {
    private readonly environmentConfig: EnvironmentConfig;

    constructor(environmentConfig: EnvironmentConfig) {
        this.environmentConfig = environmentConfig;
    }

    async initialize() {}

    getRateLimitingFunction() {
        return this.environmentConfig.getRateLimitingFunction();
    }

    getTokenCapacity(): number {
        return 5
    }

    getRefillAmount(): number {
        return 1;
    }

    getRefillIntervalMs(): number {
        return 60000; // 1 minute in milliseconds
    }

    getRefillRateMs(): number {
        return this.getRefillAmount() / this.getRefillIntervalMs();
    }
}