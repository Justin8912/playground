import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {AppConfig} from "../../../config/AppConfig.js";
import {storeStateToken} from "../util/storeStateToken.js";
import {getAPIGatewayResponse} from "../../../model/apiGatewayResponse.js";
import logger from "../../../util/logger.js";

export const GetAuthorizationUriSpotify = (appConfig: AppConfig): (event:APIGatewayProxyEvent)=>Promise<APIGatewayProxyResult> => {
    return async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        logger.info("GetAuthorizationUriSpotify called.");
        const user = event?.queryStringParameters?.user
        if ( user === undefined) {
            logger.info("User not included in the request.");
            return {
                statusCode: 400,
                body: "User id not included in the request."
            }
        }
        logger.debug("Storing the authorization state.")
        const state = await storeStateToken(
            appConfig.getEnvironmentConfig().getUser,
            appConfig.getVaultService().setParameter
        );

        return getAPIGatewayResponse(200, appConfig.getSpotifyAuthorizationUri(state));
    }
}