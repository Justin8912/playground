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

    const spotifyMusicService = await getSpotifyMusicClientService();
    await addSongToPlaylistSpotify(spotifyMusicService, res);
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
    const spotifyClient = await getSpotifyUserClient(appConfig.getHcpVaultService(), "justin");
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

const addSongToPlaylistSpotify = async (spotifyMusicService: SpotifyService, res: Response) => {
    const song = {
        title: "backbone",
        artists: ["chase and status"]
    };
    const playlistName = "Test";
    
    try {
        // First get the playlist to find its ID
        const playlist = await spotifyMusicService.getPlaylistByName(playlistName);
        if (!playlist) {
            res.status(404).json({
                message: `Playlist "${playlistName}" not found`,
                success: false,
                song,
                playlistName
            });
            return;
        }
        
        // Get the song URI
        const songUri = await spotifyMusicService.getSongUriByQuery(song);
        if (!songUri) {
            res.status(404).json({
                message: `Song "${song.title}" by ${song.artists.join(', ')} not found on Spotify`,
                success: false,
                song,
                playlistName
            });
            return;
        }
        
        // Add the song to the playlist using playlist ID and song URI
        const result = await spotifyMusicService.addSongToPlaylist(playlist.id, songUri);
        res.json({
            message: `Successfully added "${song.title}" by ${song.artists.join(', ')} to playlist "${playlistName}"`,
            success: result,
            song,
            playlistName,
            playlistId: playlist.id,
            songUri
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            message: `Failed to add song to playlist: ${errorMessage}`,
            success: false,
            song,
            playlistName
        });
    }
}