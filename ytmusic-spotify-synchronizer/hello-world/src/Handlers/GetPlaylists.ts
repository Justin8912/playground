import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {AppConfig} from "../config/AppConfig.js";
import {getAPIGatewayResponse} from "../model/apiGatewayResponse.js";
import {GetPlaylistsResponse, Song} from "../model/YtMusic.js";
import {youtube} from "googleapis/build/src/apis/youtube/index.js";
import logger from "../util/logger.js";
import {transferMusic} from "./Authorization/util/TransferMusic.js";

export const GetPlaylists = (appConfig: AppConfig): (event:APIGatewayProxyEvent)=>Promise<APIGatewayProxyResult> => {
    return async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        // let spotifyService = appConfig.getSpotifyService();
        // let sourcePlaylist: GetPlaylistsResponse | undefined = await spotifyService.getPlaylistByName("Drum and bass");
        // let targetPlaylist: GetPlaylistsResponse | undefined = await spotifyService.getPlaylistByName("Test app");
        // if (sourcePlaylist && targetPlaylist) {
        //     let songUrisPromise: Promise<string>[] = sourcePlaylist.songs.map((song: Song) => {
        //         const query = `${song.title} - ${song.artists.join(", ")}`
        //         return spotifyService.getSongUriByQuery(query);
        //     });
        //     let songUris: string[] = await Promise.all(songUrisPromise);
        //     await spotifyService.addSongsToPlaylist(targetPlaylist.id, songUris);
        //     return getAPIGatewayResponse(200, JSON.stringify(await spotifyService.getPlaylists()));
        // } else {
        //     return getAPIGatewayResponse(200, JSON.stringify({}));
        // }

        // let youtubeService = appConfig.getYtMusicService();
        // let playlists = await youtubeService.getPlaylists();
        // let songId = await youtubeService.getSongIdByQuery("False alarm - the weeknd");
        // console.log(songId);
        // let addSong = await youtubeService.addSongToPlaylist(playlists[0].id, songId as string)

        let youtubeService = appConfig.getYtMusicService();
        let spotifyService = appConfig.getSpotifyService();
        await youtubeService.videoScrapper("DJoPdsGMbH8")
        // // let sourcePlaylist = (await spotifyService.getPlaylistByName('drum and bass'));
        // // let sinkPlaylist = (await youtubeService.getPlaylistByName('Test'));
        // let sourcePlaylist = (await youtubeService.getPlaylistByName('Test'))
        // let sinkPlaylist = (await spotifyService.getPlaylistByName('Test'));
        // // logger.info("YoutubePlaylists: ", JSON.stringify(youtubeService.playlists));
        // // logger.info("sourcePlaylist: " + JSON.stringify(sourcePlaylist));
        // // logger.info("sinkPlaylist: " + JSON.stringify(sinkPlaylist));
        // if (!sourcePlaylist || !sinkPlaylist) {
        //     return getAPIGatewayResponse(200, JSON.stringify({}));
        // }
        //
        // await transferMusic(
        //     sourcePlaylist,
        //     sinkPlaylist,
        //     spotifyService.getSongUriByQuery,
        //     spotifyService.addSongsToPlaylist
        // )

        return getAPIGatewayResponse(200, JSON.stringify({status: "done!"}));
    }
}