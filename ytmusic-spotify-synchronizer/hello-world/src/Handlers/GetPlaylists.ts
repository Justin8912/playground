import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {AppConfig} from "../config/AppConfig.js";
import {getAPIGatewayResponse} from "../model/apiGatewayResponse.js";
import {GetPlaylistsResponse, Song} from "../model/YtMusic.js";

export const GetPlaylists = (appConfig: AppConfig): (event:APIGatewayProxyEvent)=>Promise<APIGatewayProxyResult> => {
    return async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        let spotifyService = appConfig.getSpotifyService();
        let sourcePlaylist: GetPlaylistsResponse | undefined = await spotifyService.getPlaylistByName("Drum and bass");
        let targetPlaylist: GetPlaylistsResponse | undefined = await spotifyService.getPlaylistByName("Test app");
        if (sourcePlaylist && targetPlaylist) {
            let songUrisPromise: Promise<string>[] = sourcePlaylist.songs.map((song: Song) => {
                const query = `${song.title} - ${song.artists.join(", ")}`
                return spotifyService.getSongUriByQuery(query);
            });
            let songUris: string[] = await Promise.all(songUrisPromise);
            await spotifyService.addSongToPlaylist(targetPlaylist.id, songUris);
            return getAPIGatewayResponse(200, JSON.stringify({}));
        } else {
            return getAPIGatewayResponse(200, JSON.stringify({}));
        }
    }
}