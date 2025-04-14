import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {AppConfig} from "../../../config/AppConfig.js";
import {getStoredStateToken, removeStoredStateToken} from "../util/storeStateToken.js";
import logger from "../../../util/logger.js";
import {returnRedirectPage} from "../util/redirectReturn.js";

export const GoogleRedirectHandler =  (appConfig: AppConfig): (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult> => {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const getResponse = returnRedirectPage("http://localhost:3000/hello");
        const vaultService = appConfig.getVaultService();
        const stateToken = event.queryStringParameters?.state;
        const authCode = event.queryStringParameters?.code
        if (stateToken === undefined || authCode === undefined ) {
            logger.debug("The statetoken or the authCode are not present in the request.")
            return getResponse();
        }

        const authStorage = await getStoredStateToken(
            stateToken,
            vaultService.getParameter
        )
        if (!authStorage) {
            logger.debug("No stateToken found in the vault service.")
            return getResponse();
        }

        const {timestamp, user} = authStorage;
        if (Date.now() - timestamp > 600000) {
            logger.debug("The stateToken has expired, please try to authenticate again");
            await removeStoredStateToken(stateToken, vaultService.removeParameter);
            return getResponse();
        }

        let googleRes = await appConfig.getGoogleOauth2Client().getToken(authCode);
        await vaultService.setParameter(`google/${user}`, {
            refresh_token: googleRes.tokens.refresh_token,
            access_token: googleRes.tokens.access_token
        })

        await removeStoredStateToken(stateToken, vaultService.removeParameter);

        return getResponse();
    }
}