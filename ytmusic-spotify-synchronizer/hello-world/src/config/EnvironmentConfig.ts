export class EnvironmentConfig {
    private readonly user: string;
    constructor(user: string) {
        this.user = user;
    }

    private getEnvironmentVariable = (name: string): string => {
        const value = process.env[name];
        if (!value) {
            throw new Error(`Environment variable ${name} not found`);
        }
        return value
    }

    public getUser = (): string => {
        return this.user;
    }

    public getVaultToken = (): string => {
        return this.getEnvironmentVariable("VAULT_TOKEN");
    }
}