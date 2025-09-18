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
}