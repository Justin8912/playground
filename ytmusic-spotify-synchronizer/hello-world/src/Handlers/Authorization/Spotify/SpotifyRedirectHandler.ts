import {AppConfig} from "../../../config/AppConfig.js";
import {APIGatewayProxyEvent} from "aws-lambda";
import logger from "../../../util/logger.js";
import {returnRedirectPage} from "../util/redirectReturn.js";
import {getStoredStateToken, removeStoredStateToken} from "../util/storeStateToken.js";

export const SpotifyRedirectHandler = (appConfig: AppConfig) => {
    return async (event: APIGatewayProxyEvent) => {
        logger.info("SpotifyRedirectHandler called.");
        const getResponse = returnRedirectPage("http://localhost:3000/hello");

        const stateToken = event.queryStringParameters?.state;
        const authCode = event.queryStringParameters?.code
        if (stateToken === undefined || authCode === undefined ) {
            logger.debug("The statetoken or the authCode are not present in the request.")
            return getResponse();
        }

        const authStorage = await getStoredStateToken(
            stateToken,
            appConfig.getVaultService().getParameter
        )
        if (!authStorage) {
            logger.debug("No stateToken found in the vault service.")
            return getResponse();
        }

        const {timestamp, user} = authStorage;
        if (Date.now() - timestamp > 600000) {
            logger.debug("The stateToken has expired, please try to authenticate again");
            await removeStoredStateToken(stateToken, appConfig.getVaultService().removeParameter);
            return getResponse();
        }

        // Exchange the code for the access token and refresh token and store them
        const authToken = "Basic " + Buffer.from(
            `${appConfig.getSpotifyClientId()}:${appConfig.getSpotifyClientSecret()}`
        ).toString("base64");

        let authOptions = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': authToken
            },
            body: new URLSearchParams({
                code: authCode,
                redirect_uri: appConfig.getSpotifyRedirectUri(),
                grant_type: 'authorization_code'
            }),
            method: "POST"
        };

        logger.debug("Exchanging the auth code for the access token.");
        let result  = await fetch('https://accounts.spotify.com/api/token', authOptions);
        const {
            access_token,
            refresh_token,
            token_type,
            expires_in
        } = await result.json() as { access_token: string, refresh_token: string, token_type: string, expires_in: string };

        logger.debug("Setting the access and refresh tokens in vault.");
        await appConfig.getVaultService().setParameter(`${user}`, {
            spotifyRefreshToken: refresh_token,
            spotifyAccessToken: access_token,
            spotifyTokenType: token_type,
            spotifyTokenExpiresIn: expires_in
        })

        // Remove the state token from the vault
        await removeStoredStateToken(stateToken, appConfig.getVaultService().removeParameter);

        return getResponse();
    }
}