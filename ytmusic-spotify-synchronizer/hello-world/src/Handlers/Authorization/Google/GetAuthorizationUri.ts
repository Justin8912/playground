import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import crypto from "crypto";
import {google} from "googleapis"
import {AppConfig} from "../../../config/AppConfig.js";
import {genericErrorResponse} from "../../../Response/GenericErrorResponse.js";
import {getAPIGatewayResponse} from "../../../model/apiGatewayResponse.js";

export const GetAuthorizationUriGoogle = (appConfig: AppConfig)  => {
    return async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const user = event?.queryStringParameters?.user
        if ( user === undefined) {
            return {
                statusCode: 400,
                body: "User id not included in the request."
            }
        }

        const state = crypto.randomBytes(32).toString('hex');

        try {
            console.log("Beginning to set the parameter: ", state)
            await appConfig.getVaultService().setParameter(`temp-auth/${state}`, {
                user: appConfig.getEnvironmentConfig().getUser(),
                timestamp: Date.now()
            });
        } catch(err) {
            return genericErrorResponse("Failed to write document to vault in google authorization uri.");
        }

        const authorizationUri = appConfig.getGoogleOauth2Client().generateAuthUrl({
            access_type: "offline",
            scope: ["https://www.googleapis.com/auth/youtube.readonly", "https://www.googleapis.com/auth/youtube.upload"],
            include_granted_scopes: true,
            state
        })

        return getAPIGatewayResponse(200, authorizationUri);
    }
}