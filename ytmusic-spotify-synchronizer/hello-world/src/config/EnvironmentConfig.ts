export class EnvironmentConfig {
    private readonly user: string;
    constructor(user: string) {
        this.user = user;
    }

    public getUser = (): string => {
        return this.user;
    }

    public getClientId = (): string => {
        // Get client id based on the user
        return ""
    }

    public getClientRefreshToken = (): string => {
        // Get client refresh token based on the user
        return ""
    }
}