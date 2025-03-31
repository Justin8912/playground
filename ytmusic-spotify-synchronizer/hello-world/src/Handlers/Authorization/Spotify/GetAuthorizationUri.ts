import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {AppConfig} from "../../../config/AppConfig.js";
import {storeStateToken} from "../util/storeStateToken.js";
import {getAPIGatewayResponse} from "../../../model/apiGatewayResponse.js";
import logger from "../../../util/logger.js";

const generateUrl = (appConfig: AppConfig, state: string) => {
    const baseUrl = "https://accounts.spotify.com/authorize";
    const queryParams = [
        ["response_type", "code"],
        ["scopes", appConfig.getEnvironmentConfig().getSpotifyScopes().join(",")],
        ["client_id", appConfig.getSpotifyClientId()],
        ["redirect_uri", appConfig.getSpotifyRedirectUri()],
        ["state", state]
    ]
    const searchParams = new URLSearchParams(queryParams);
    return baseUrl + "?" + searchParams.toString()
}

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


        return getAPIGatewayResponse(200, generateUrl(appConfig, state));
    }
}