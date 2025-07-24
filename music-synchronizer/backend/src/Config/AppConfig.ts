import {HCPVaultService} from "../Services/VaultService.js";
import {EnvironmentConfig} from "./EnvironmentConfig.js";
import {OAuth2Client} from "google-auth-library";
import {getGoogleUserClient} from "../Services/GoogleClientFactory.js";

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

    getGoogleClient = async (userId: string): Promise<OAuth2Client> => {
        return await getGoogleUserClient(userId, this.hcpVaultService);
    }

}