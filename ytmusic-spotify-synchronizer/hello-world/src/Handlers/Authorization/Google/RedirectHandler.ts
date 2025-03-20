import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {AppConfig} from "../../../config/AppConfig.js";
import {getAPIGatewayResponse} from "../../../model/apiGatewayResponse.js";

export const RedirectHandler =  (appConfig: AppConfig): (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult> => {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const redirectToPage = `
            <!DOCTYPE html>
            <html lang="en">
            <meta http-equiv="refresh" content="0;url=http://localhost:3000/hello" />
            </html>
        `;
        const getResponse = () => getAPIGatewayResponse(200, redirectToPage, {headers: {'Content-Type':"text/html"}});

        const stateToken = event.queryStringParameters?.state;
        const authCode = event.queryStringParameters?.code
        if (stateToken === undefined || authCode === undefined ) {
            console.log("The statetoken or the authCode are not present in the request.")
            return getResponse();
        }

        // const authStorage: DocumentData = await getFromFirestore("temp_auth", stateToken);
        const authStorage = await appConfig.getVaultService().getParameter(`temp-auth/${stateToken}`);
        console.log("Here is the security token: ", authStorage);
        if (!authStorage) {
            return getResponse();
        }

        const {timestamp, user} = authStorage;
        if (Date.now() - timestamp > 600000) {
            console.log("The stateToken has expired, please try to authenticate again");
            await appConfig.getVaultService().removeParameter(`temp-auth/${stateToken}`);
            return getResponse();
        }

        console.log("conjunction junction, what's your function?")
        let googleRes = await appConfig.getGoogleOauth2Client().getToken(authCode);
        console.log("Retrieved tokens from google, storing in hcp vault: ", googleRes.tokens)

        await appConfig.getVaultService().setParameter(`${user}`, {
            googleRefreshToken: googleRes.tokens.refresh_token,
            googleAccessToken: googleRes.tokens.access_token
        })

        return getResponse();
    }
}