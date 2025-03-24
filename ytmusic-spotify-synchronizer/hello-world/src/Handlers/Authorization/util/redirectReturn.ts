import {APIGatewayProxyResult} from "aws-lambda";
import {getAPIGatewayResponse} from "../../../model/apiGatewayResponse.js";

export const returnRedirectPage = (redirectUri: string): ()=>APIGatewayProxyResult => {
    return () => {
        const redirectToPage = `
            <!DOCTYPE html>
            <html lang="en">
            <meta http-equiv="refresh" content="0;url=${redirectUri}" />
            </html>
        `;
        return getAPIGatewayResponse(200, redirectToPage, {headers: {'Content-Type':"text/html"}});
    }
}