import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {AppConfig} from "../../../config/AppConfig.js";
import {getAPIGatewayResponse} from "../../../model/apiGatewayResponse.js";
import {storeStateToken} from "../util/storeStateToken.js";

export const GetAuthorizationUriGoogle = (appConfig: AppConfig)  => {
    return async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const user = event?.queryStringParameters?.user
        if ( user === undefined) {
            return {
                statusCode: 400,
                body: "User id not included in the request."
            }
        }

        const state = await storeStateToken(
            appConfig.getEnvironmentConfig().getUser,
            appConfig.getVaultService().setParameter
        );

        const authorizationUri = appConfig.getGoogleOauth2Client().generateAuthUrl({
            access_type: "offline",
            scope: ["https://www.googleapis.com/auth/youtube.readonly", "https://www.googleapis.com/auth/youtube.upload"],
            include_granted_scopes: true,
            state
        })

        return getAPIGatewayResponse(200, authorizationUri);
    }
}