import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {AppConfig} from "../config/AppConfig.js";
import {getAPIGatewayResponse} from "../model/apiGatewayResponse.js";

export const GetPlaylists = (appConfig: AppConfig): (event:APIGatewayProxyEvent)=>Promise<APIGatewayProxyResult> => {
    return async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        // Call the api
        let user = event.queryStringParameters?.user as string;

        // First we will try to get the playlists from youtube
        let playlists = await appConfig.getYtMusicService().getPlaylists()
        return getAPIGatewayResponse(200, JSON.stringify(playlists));

        // console.log("playlists")
        // return {} as APIGatewayProxyResult;
    }
}