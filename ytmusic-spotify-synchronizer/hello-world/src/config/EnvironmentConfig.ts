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

    public getSpotifyScopes = (): string[] => {
        // For scopes look here: https://developer.spotify.com/documentation/web-api/concepts/scopes
        return [
            "playlist-read-private",
            "playlist-read-collaborative",
            "playlist-modify-private",
            "playlist-modify-public",
            "user-read-private",
            "user-read-email"
        ]
    }
}