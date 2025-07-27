import {HCPVaultService} from "../Services/VaultService.js";
import {EnvironmentConfig} from "./EnvironmentConfig.js";
import {getGoogleUserClient, GoogleUserClient} from "../Services/GoogleClientFactory.js";
import {getSpotifyUserClient, SpotifyClient} from "../Services/SpotifyClientFactory.js";

export class AppConfig {
    private environmentConfig: EnvironmentConfig;
    private hcpVaultService: HCPVaultService;

    constructor() {
        this.initialize();
    }

    initialize = (): void => {
        this.environmentConfig = new EnvironmentConfig();
        this.hcpVaultService = this.getHcpVaultService();
    }

    getHcpVaultService = (): HCPVaultService => {
        return new HCPVaultService(this.environmentConfig.getVaultToken());
    }

    // TODO: Determine if this should be here or not
    getGoogleClient = async (userId: string): Promise<GoogleUserClient> => {
        return await getGoogleUserClient(userId, this.hcpVaultService);
    }

    // TODO: Determine if this should be here or not
    getSpotifyClient = async (userId: string): Promise<SpotifyClient> => {
        return await getSpotifyUserClient(this.hcpVaultService, userId);
    }
}