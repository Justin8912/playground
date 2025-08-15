import {Request, Response} from "express";
import {AppConfig} from "../Config/AppConfig.js";
import { getYoutubeMusicService, YoutubeMusicClientService } from "../Services/YoutubeMusicClientService.js";
import { getGoogleUserClient } from "../Services/GoogleClientFactory.js";
import { getSpotifyUserClient } from "../Services/SpotifyClientFactory.js";
import { SpotifyService, getSpotifyService } from "../Services/SpotifyService.js";

export const defaultHandler = async (req: Request, res: Response): Promise<void> => {
    // Need something to extract important information from the request
    // something to identify the path
    // await getPopulatedPlaylists(res);
    // const youtubeMusicService = await getYoutubeMusicClientService();
    // await getPopulatedPlaylists(youtubeMusicService, res);
    const youtubeMusicService = await getYoutubeMusicClientService();
    const spotifyMusicService = await getSpotifyMusicClientService();
    // await addSongsToPlaylistSpotify(spotifyMusicService, res);
    await synchronizeFromSpotifyToYoutube(res, youtubeMusicService, spotifyMusicService);
}


const getYoutubeMusicClientService = async () => {
    // Initialize the youtubeMusicClientService 
    const appConfig = new AppConfig();
    const googleUserClient = await getGoogleUserClient("justin", appConfig.getHcpVaultService());
    return await getYoutubeMusicService(googleUserClient);
}

const getSpotifyMusicClientService = async (): Promise<SpotifyService> => {
    // Initialize the spotifyMusicClientService
    const appConfig = new AppConfig();
    const spotifyClient = await getSpotifyUserClient("justin", appConfig.getHcpVaultService());
    return await getSpotifyService(spotifyClient);
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
    res.json(await youtubeMusicService.getPlaylists());
}

const getPlaylistIdsSpotify = async (spotifyMusicService: SpotifyService, res: Response) => {
    const result = await spotifyMusicService.getPlaylistIds();
    res.json(result);
}

const getPlaylistsSpotify = async (spotifyMusicService: SpotifyService, res: Response) => {
    const result = await spotifyMusicService.getPlaylists();
    res.json(result);
}

const createPlaylistSpotify = async (spotifyMusicService: SpotifyService, res: Response) => {
    const playlistName = "Test Playlist Created " + new Date().toISOString();
    const description = "Test playlist created by the Spotify service";
    const playlistId = await spotifyMusicService.createPlaylist(playlistName, description);
    res.json({ 
        message: "Playlist created successfully",
        playlistId,
        name: playlistName,
        description
    });
}

const getPlaylistByNameSpotify = async (spotifyMusicService: SpotifyService, res: Response) => {
    const playlistName = "NonExistentPlaylist"; // Testing with a playlist that doesn't exist
    const playlist = await spotifyMusicService.getPlaylistByName(playlistName);
    
    if (playlist) {
        res.json({
            message: "Playlist found successfully",
            playlist
        });
    } else {
        res.json({
            message: `No playlist found with name '${playlistName}'`,
            playlist: null
        });
    }
}

const getSongUriByQuerySpotify = async (spotifyMusicService: SpotifyService, res: Response) => {
    const song = {
        title: "Backbone",
        artists: ["Chase & Status", "Stormzy"]
    };
    
    const songUri = await spotifyMusicService.getSongUriByQuery(song);
    
    if (songUri) {
        res.json({
            message: "Song found successfully",
            song,
            uri: songUri
        });
    } else {
        res.json({
            message: `No song found for '${song.title}' by ${song.artists.join(', ')}`,
            song,
            uri: null
        });
    }
}

const addSongsToPlaylistSpotify = async (spotifyMusicService: SpotifyService, res: Response) => {
    const songs = [
        {
            title: "backbone",
            artists: ["chase and status"]
        },
        {
            title: "Shivers",
            artists: ["Ed Sheeran"]
        },
        {
            title: "Bad Habits",
            artists: ["Ed Sheeran"]
        }
    ];
    const playlistName = "Test";
    
    try {
        const result = await spotifyMusicService.addSongsToPlaylist(playlistName, songs);
        res.json({
            message: `Successfully added songs to playlist "${playlistName}"`,
            success: result,
            songs,
            playlistName,
            songsCount: songs.length
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            message: `Failed to add songs to playlist: ${errorMessage}`,
            success: false,
            songs,
            playlistName
        });
    }
}

const synchronizeFromYoutubeToSpotify = async (res: Response, youtubeMusicService: YoutubeMusicClientService, spotifyMusicService: SpotifyService): Promise<void> => {
    // Get playlists from YouTube Music
    const youtubePlaylists = await youtubeMusicService.getPlaylists();
    console.info("Retrieved YouTube Music playlists:", youtubePlaylists);
    const sourcePlaylist = await youtubeMusicService.getPlaylistByName("Test");

    const targetPlaylist = await spotifyMusicService.getPlaylistByName("Test");


    if (!targetPlaylist) {
        console.log("Could not find target playlist");
        return;
    }

    if (!sourcePlaylist) {
        console.log("Could not find source playlist");
        return;
    }

    await spotifyMusicService.addSongsToPlaylist(targetPlaylist.title, sourcePlaylist.songs);

    res.json({ message: "Synchronization completed successfully." });
}

const synchronizeFromSpotifyToYoutube = async (res: Response, youtubeMusicService: YoutubeMusicClientService, spotifyMusicService: SpotifyService): Promise<void> => {
    // Get playlists from YouTube Music
    const youtubePlaylists = await youtubeMusicService.getPlaylists();
    console.info("Retrieved YouTube Music playlists:", youtubePlaylists);
    const targetPlaylist = await youtubeMusicService.getPlaylistByName("Test");

    const sourcePlaylist = await spotifyMusicService.getPlaylistByName("Test");


    if (!targetPlaylist) {
        console.log("Could not find target playlist");
        return;
    }

    if (!sourcePlaylist) {
        console.log("Could not find source playlist");
        return;
    }

    await youtubeMusicService.addSongsToPlaylist(targetPlaylist.title, sourcePlaylist.songs);

    res.json({ message: "Synchronization completed successfully." });
}