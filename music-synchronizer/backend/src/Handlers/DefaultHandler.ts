import {Request, Response} from "express";
import {AppConfig} from "../Config/AppConfig.js";
import { getYoutubeMusicService, YoutubeMusicClientService } from "../Services/YoutubeMusicClientService.js";
import { getGoogleUserClient } from "../Services/GoogleClientFactory.js";
import { getSpotifyUserClient } from "../Services/SpotifyClientFactory.js";

export const defaultHandler = async (req: Request, res: Response): Promise<void> => {
    // Need something to extract important information from the request
    // something to identify the path
    // await getPopulatedPlaylists(res);
    const youtubeMusicService = await getYoutubeMusicClientService();
    await getPopulatedPlaylists(youtubeMusicService, res);
}


const getYoutubeMusicClientService = async () => {
    // Initialize the youtubeMusicClientService 
    const appConfig = new AppConfig();
    const googleUserClient = await getGoogleUserClient("justin", appConfig.getHcpVaultService());
    return await getYoutubeMusicService(googleUserClient);
}

const getSpotifyMusicClientService = async () => {
    // Initialize the spotifyMusicClientService
    const appConfig = new AppConfig();
    const spotifyClient = getSpotifyUserClient(appConfig.getHcpVaultService(), "justin");
    // Get and return the spotifyService

}

const getYoutubePlaylistIds = async (youtubeMusicService: YoutubeMusicClientService, res: Response) => {
    const result = await youtubeMusicService.getPlaylistIds();
    res.json(result);
}

const getPopulatedPlaylists = async (youtubeMusicService: YoutubeMusicClientService, res: Response) => {
    const result = await youtubeMusicService.getPopulatedPlaylists();
    res.json(result);
}

const createPlaylist = async (youtubeMusicService: YoutubeMusicClientService, res: Response) => {
    const playlistId = await youtubeMusicService.createPlaylist("testTitle", "testDescription");
    res.json({ playlistId });
}

const getSongIdByQuery = async (youtubeMusicService: YoutubeMusicClientService, res: Response) => {
    const songId = await youtubeMusicService.getSongIdByQuery("Backbone by Chase and Status");
    res.json({ songId });
}

const addSongToPlaylist = async (youtubeMusicService: YoutubeMusicClientService, res: Response) => {
    const songId = await youtubeMusicService.getSongIdByQuery("Backbone by Chase and Status");
    const playlistId = await youtubeMusicService.createPlaylist("testTitle", "testDescription");
    const response = await youtubeMusicService.addSongsToPlaylist(playlistId, [songId as string]);
    res.json(response);
}

const getPlaylistByName = async (youtubeMusicService: YoutubeMusicClientService, res: Response) => {
    const playlistName = "Test";
    const playlist = await youtubeMusicService.getPlaylistByName(playlistName);
    if (playlist) {
        res.json(playlist);
    } else {
        res.status(404).json({ message: `Playlist with name ${playlistName} not found` });
    }
}

const removeSongFromPlaylist = async (youtubeMusicService: YoutubeMusicClientService, res: Response) => {
    const playlistName = "Test"; // Replace with actual playlist ID
    const playlistId = await youtubeMusicService.getPlaylistByName(playlistName);
    const videoId = "o1eQvJOp5ww"; // Replace with actual video ID - would need to be updated
    await youtubeMusicService.removeSongFromPlaylist(playlistId?.id as string, videoId);
    res.json(await youtubeMusicService.getPopulatedPlaylists());
}