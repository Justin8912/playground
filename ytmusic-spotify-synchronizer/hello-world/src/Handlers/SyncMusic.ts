import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {AppConfig} from "../config/AppConfig.js";
import {getAPIGatewayResponse} from "../model/apiGatewayResponse.js";
import {GetPlaylistsResponse, Song} from "../model/MusicTypes.js";
import {youtube} from "googleapis/build/src/apis/youtube/index.js";
import logger from "../util/logger.js";
import {transferMusic} from "./Authorization/util/TransferMusic.js";

export const SyncMusic = (): (event:APIGatewayProxyEvent)=>Promise<APIGatewayProxyResult> => {
    return async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        let sourceUser
        let sourceService
        let sourcePlaylist
        let sinkUser
        let sinkService
        let sinkPlaylist

        if (event.queryStringParameters) {
            sourceUser = event.queryStringParameters["sourceUser"];
            sourceService = event.queryStringParameters["sourceService"];
            sourcePlaylist = event.queryStringParameters["sourcePlaylist"];
            sinkUser = event.queryStringParameters["sinkUser"];
            sinkService = event.queryStringParameters["sinkService"];
            sinkPlaylist = event.queryStringParameters["sinkPlaylist"];
        } else {
            return getAPIGatewayResponse(400, JSON.stringify({status: "Not all Query String Parameters were included. Please check request and try again."}))
        }


        return getAPIGatewayResponse(200, JSON.stringify({status: "done!"}));
    }
}

// I need a function that will take in the sourceConfig and the sinkConfig
