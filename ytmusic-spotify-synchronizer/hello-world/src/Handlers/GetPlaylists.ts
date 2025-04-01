import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {AppConfig} from "../config/AppConfig.js";
import {getAPIGatewayResponse} from "../model/apiGatewayResponse.js";

export const GetPlaylists = (appConfig: AppConfig): (event:APIGatewayProxyEvent)=>Promise<APIGatewayProxyResult> => {
    return async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        // First we will try to get the playlists from youtube
        // let playlists = await appConfig.getYtMusicService().getPlaylists()
        // let playlists = await appConfig.getSpotifyService().getPlaylists();
        let playlists = await appConfig.getSpotifyService().searchForSong("maniac - carpenter brut")
        console.log("Maniac by carpenter: ", playlists);
        const playlistId = await appConfig.getSpotifyService().getPlaylistIdByName("Test app")
        if (playlistId) {
            let playlists = await appConfig.getSpotifyService().addSongToPlaylist(playlistId, "spotify:track:2IxhiriDpu4iBnXZb3ytXN");
            console.log(playlists);
            return getAPIGatewayResponse(200, JSON.stringify(playlists));
        } else {
            return getAPIGatewayResponse(200, JSON.stringify({}));

        }

        // console.log("playlists")
        // return {} as APIGatewayProxyResult;
    }
}