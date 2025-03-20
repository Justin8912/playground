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

    public getGoogleClientId = (): string => {
        // Get client id based on the user
        return this.getEnvironmentVariable("GOOGLE_CLIENT_ID");
    }

    public getGoogleClientSecret = (): string => {
        // Get client refresh token based on the user
        return this.getEnvironmentVariable("GOOGLE_CLIENT_SECRET");
    }

    public getGoogleClientRedirectUri = (): string => {
        return this.getEnvironmentVariable("GOOGLE_CLIENT_REDIRECT_URI");
    }

    public getVaultToken = (): string => {
        return this.getEnvironmentVariable("VAULT_TOKEN");
    }

    public getSpotifyClientId = (): string => {
        return "";
    }

    public getSpotifyClientSecret = (): string => {
        return "";
    }
}