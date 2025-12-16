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

    public getGoogleScopes = (): string[] => {
        return [
            "https://www.googleapis.com/auth/youtube.readonly",
            "https://www.googleapis.com/auth/youtube.upload",
            "https://www.googleapis.com/auth/youtube.force-ssl"
        ]
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