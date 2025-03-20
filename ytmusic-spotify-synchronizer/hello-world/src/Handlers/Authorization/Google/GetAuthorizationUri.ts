import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import crypto from "crypto";
import {google} from "googleapis"
import {AppConfig} from "../../../config/AppConfig.js";
import {genericErrorResponse} from "../../../Response/GenericErrorResponse.js";

export const GetAuthorizationUriGoogle = (appConfig: AppConfig)  => {
    return async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const user = event?.pathParameters?.user
        if ( user === undefined) {
            return {
                statusCode: 400,
                body: "User id not included in the request."
            }
        }

        console.log("process.env.clientId: ", process.env.clientId);
        console.log("process.env.clientSecret: ", process.env.clientSecret);
        console.log("process.env.redirectUri: ", process.env.redirectUri);

        const oauth2Client = new google.auth.OAuth2(
            process.env.clientId,
            process.env.clientSecret,
            process.env.redirectUri
        );

        const state = crypto.randomBytes(32).toString('hex');

        try {
            // await writeToFirestore(
            //     "temp_auth", state, {
            //         "userId":userId,
            //         "timestamp": Date.now()
            //     });
            await appConfig.getVaultService().setParameter(`temp_auth/${user}`, {
                state,
                timestamp: Date.now()
            });
        } catch(err) {
            return genericErrorResponse("Failed to write document to vault in google authorization uri.");
        }

        const authorizationUri = oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: "https://www.googleapis.com/auth/drive",
            include_granted_scopes: true,
            state
        })

        return { body: authorizationUri };
    }
}