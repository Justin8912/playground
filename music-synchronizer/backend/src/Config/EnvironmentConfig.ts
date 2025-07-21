export class EnvironmentConfig {
    constructor() {}

    private getEnvironmentVariable = (name: string): string => {
        const value = process.env[name];
        if (!value) {
            throw new Error(`Environment variable ${name} not found`);
        }
        return value
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