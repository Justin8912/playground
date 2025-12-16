import { youtube_v3, google } from "googleapis";
import {
    GetPlaylistsResponse, 
    PlaylistWithoutSongs,
    Song
} from "../Model/MusicService.js"
import {getGoogleUserClient, GoogleUserClient} from "./GoogleClientFactory.js";
import {HCPVaultService} from "./VaultService.js";
import logger from "../Util/logger.js";
import {doSongsMatch, normalizeSongTitle} from "../Util/titleMatcher.js";
import {MusicServiceInterface} from "./MusicServiceInterface.js";
import {sleep} from "../Util/sleep.js";
import {PlaylistRetrievalError} from "../Errors/PlaylistRetrievalError.js";
import {SongRetrievalError} from "../Errors/SongRetrievalError.js";
import {AddSongError} from "../Errors/AddSongError.js";
import {PlaylistNotFoundError} from "../Errors/PlaylistNotFoundError.js";

export class YoutubeMusicClientService implements MusicServiceInterface {
    private googleUserClient: GoogleUserClient;
    private youtube: youtube_v3.Youtube;
    public playlists: GetPlaylistsResponse[] = [];

    constructor(googleUserClient: GoogleUserClient) {
        this.googleUserClient = googleUserClient;
        this.youtube = google.youtube({ version: "v3", auth: this.googleUserClient.getAuthClient() });
    }

    public async initialize(): Promise<void> {
        try {
            await this.googleUserClient.validateToken();
            // TODO: We will want to implement caching at some point so that we can avoid hitting rate limits
            // this.playlists = await this.getPlaylists();
            this.logInfoMessage(`YouTube Music Client initialized with ${this.playlists.length} playlists`);
        } catch (error) {
            throw new Error('Failed to initialize the YoutubeMusicClient: ' + error);
        }
    }

    public async getPlaylists(): Promise<GetPlaylistsResponse[]> {
        try {
            this.logInfoMessage("Retrieving playlists");
            const playlistIds = await this.getPlaylistIds();
            const playlistPromises = playlistIds.map((playlist: PlaylistWithoutSongs) => {
                if (!playlist.description?.toLowerCase().includes("music")) return
                return this.getSongs(playlist.id).then((songs: Song[]) => ({
                    id: playlist.id,
                    title: playlist.title,
                    description: playlist.description,
                    image: playlist.image,
                    songs: songs
                }))
                })
                .filter(playlist => !!playlist);
            const populatedPlaylists = await Promise.all(playlistPromises);
            this.logDebugMessage("Youtube playlists", {data: populatedPlaylists.map(p => p.title)})
            return populatedPlaylists
        } catch (error) {
            throw new PlaylistRetrievalError('Failed to get populated YouTube Music playlists', {cause: error});
        }
    }

    public async getPlaylistIds(): Promise<PlaylistWithoutSongs[]> {
        try {            
            let nextPageToken: string | undefined = undefined;
            let result: PlaylistWithoutSongs[] = [];
            
            do {
                const response: any = await this.youtube.playlists.list({
                    part: ["id", "snippet"],
                    mine: true,
                    pageToken: nextPageToken,
                    maxResults: 50
                });

                if (response.data?.items) {
                    const playlistData = response.data.items.map((playlist: any) => ({
                        id: playlist.id!,
                        title: playlist.snippet?.title || 'Untitled Playlist',
                        description: playlist.snippet?.description,
                        image: playlist.snippet?.thumbnails?.default?.url 
                            ? { url: playlist.snippet.thumbnails.default.url }
                            : undefined
                    })).filter((playlist: any) => playlist.description.toLowerCase().includes("music"));

                    result = result.concat(playlistData);
                }

                nextPageToken = response.data?.nextPageToken;
            } while (nextPageToken);

            return result;
        } catch (error) {
            throw new PlaylistRetrievalError('Failed to get YouTube Music playlist IDs', {cause: error});
        }
    }

    public async getSongs(playlistId: string): Promise<Song[]> {
        try {            
            let nextPageToken: string | undefined = undefined;
            let result: Song[] = [];
            
            do {
                const playlistItemsOptions = {
                    playlistId: playlistId,
                    part: ["snippet"],
                    pageToken: nextPageToken,
                    maxResults: 50
                }
                const response: any = await this.youtube.playlistItems.list(playlistItemsOptions);

                if (response.data?.items) {
                    const songs = response.data.items.map((item: any) => {
                        const videoId = item.snippet?.resourceId?.videoId;
                        const title = item.snippet?.title || 'Unknown Title';
                        const channelTitle = item.snippet?.videoOwnerChannelTitle || item.snippet?.channelTitle || 'Unknown Artist';
                        const description = item.snippet?.description;
                        
                        return {
                            title: normalizeSongTitle(title),
                            artists: [channelTitle],
                            description: description,
                            videoId: videoId
                        };
                    }).filter((song: Song) => song.videoId); // Filter out items without video IDs
                    
                    result = result.concat(songs);
                }

                nextPageToken = response.data?.nextPageToken;
            } while (nextPageToken);

            return result;
        } catch (error) {
            throw new SongRetrievalError('Failed to get songs from YouTube Music playlist', {cause: error});
        }
    }

    public async getSong(song: Song): Promise<Song | null> {
        const query = `${song.title} ${song.artists.join(' ')}`;
        return await this.getSongByQuery(query);
    }

    public async getSongByQuery(query: string): Promise<Song | null> {
        try {
            const searchResult: any = await this.youtube.search.list({
                part: ["snippet"],
                q: query,
                type: ["video"],
                maxResults: 1
            });

            await sleep();

            if (!searchResult?.data?.items || searchResult.data.items.length === 0) {
                this.logInfoMessage(`No videos found for query: "${query}"`);
                return null;
            }

            for (const video of searchResult.data.items) {
                if (video?.id?.kind?.toLowerCase() === "youtube#video") {
                    const videoId = video.id.videoId;
                    this.logInfoMessage(`Found video "${video.snippet?.title}" with ID: ${videoId} for query: "${query}"`);
                    return {
                        title: video.snippet.title,
                        artists: [video.snippet.channelTitle],
                        description: video.snippet.description,
                        videoId
                    }
                }
            }

            this.logInfoMessage(`No valid songs found for query: "${query}"`);
            return null;
        } catch (error) {
            throw new SongRetrievalError(`An error occurred when searching for '${query}' on YouTube Music`, {cause: error});
        }
    }

    // Note: May come back to this but for now users must have the playlist created ahead of time
    // public async createPlaylist(title: string, description?: string): Promise<string> {
    //     try {
    //         const response: any = await this.youtube.playlists.insert({
    //             part: ["snippet", "status"],
    //             requestBody: {
    //                 snippet: {
    //                     title: title,
    //                     description: description || `Created by YouTube Music Client on ${new Date().toISOString()}`
    //                 },
    //                 status: {
    //                     privacyStatus: "private" // Default to private, can be changed later
    //                 }
    //             }
    //         });
    //
    //         const playlistId = response.data?.id;
    //         if (!playlistId) {
    //             throw new Error('No playlist ID returned from YouTube API');
    //         }
    //
    //         console.log(`Created playlist "${title}" with ID: ${playlistId}`);
    //         return playlistId;
    //     } catch (error) {
    //         throw new Error('Failed to create YouTube Music playlist: ' + error);
    //     }
    // }

    private async addSongToPlaylist(playlistId: string, videoId: string): Promise<any> {
        try {
            const response: any = await this.youtube.playlistItems.insert({
                part: ["snippet"],
                requestBody: {
                    snippet: {
                        playlistId: playlistId,
                        resourceId: {
                            kind: "youtube#video",
                            videoId: videoId
                        }
                    }
                }
            });

            await sleep();
            return response;
        } catch (error) {
            throw new AddSongError(`Failed to add song ${videoId} to YouTube Music playlist ${playlistId}`, {cause: error});
        }
    }

    // TODO Refactor these two methods, this has business logic in it and should be separated
    public async addSongsToPlaylist(playlistName: string, songs: Song[]): Promise<Song[]> {
        const failedSongAdds: Song[] = [];
        const responses = [];
        const playlistId = (await this.getPlaylistByName(playlistName)).id;

        try {
            for (const song of songs) {
                try {
                    const video = await this.getSong(song);
                    if (video) {
                        if (doSongsMatch(song, video)) {
                            const response = await this.addSongToPlaylist(playlistId, video.videoId as string);
                            responses.push(response);
                        } else {
                            this.logInfoMessage(`Song found does not strongly match the query\n\tFound song: ${video.title} ${video.artists.join(", ")}\n\tRequested song: ${song.title} ${song.artists.join(", ")}`);
                            failedSongAdds.push(song);
                        }
                    } else {
                        this.logInfoMessage(`The following song was not found in youtube:\n\tRequested song: ${song.title} ${song.artists.join(", ")}`);
                        failedSongAdds.push(song);
                    }
                } catch (error) {
                    // Continue with other songs rather than failing completely
                    this.logInfoMessage(`Failed to add video for ${song.title} to playlist ${playlistName}:`, {cause: error});
                    failedSongAdds.push(song);
                }
            }

            this.logInfoMessage(`Successfully added ${responses.length} out of ${songs.length} songs to playlist ${playlistName}`);
            return failedSongAdds;
        } catch (error) {
            throw new AddSongError('Failed to add songs to YouTube Music playlist', {cause: error});
        }
    }

    public async addUserApprovedSongsToPlaylist(playlistName: string, songs: Song[]): Promise<Song[]> {
        const failedSongAdds: Song[] = [];
        const responses = [];
        const playlistId = (await this.getPlaylistByName(playlistName)).id;

        try {
            for (const song of songs) {
                try {
                    const response = await this.addSongToPlaylist(playlistId, song.videoId as string);
                    responses.push(response);
                } catch (error) {
                    // Continue with other songs rather than failing completely
                    this.logInfoMessage(`Failed to add video for ${song.title} to playlist ${playlistName}:`, {cause: error});
                    failedSongAdds.push(song);
                }
            }

            this.logInfoMessage(`Successfully added ${responses.length} out of ${songs.length} songs to playlist ${playlistId}`);
            return failedSongAdds;
        } catch (error) {
            throw new AddSongError('Failed to add songs to YouTube Music playlist', {cause:error});
        }
    }

    public async getPlaylistByName(name: string): Promise<GetPlaylistsResponse> {
        if (this.playlists.length === 0) {
            this.logDebugMessage('Playlists cache is empty, loading playlists...');
            this.playlists = await this.getPlaylists();
        }
        const foundPlaylist = this.playlists.find(
            playlist => playlist.title.toLowerCase() === name.toLowerCase()
        );

        this.logDebugMessage("Youtube playlists: ", {data: this.playlists.map(p => p.title)});
        if (foundPlaylist) {
            this.logInfoMessage(`Found playlist "${name}" with ID: ${foundPlaylist.id}`);
            return foundPlaylist;
        } else {
            throw new PlaylistNotFoundError(`No playlist with name "${name}"`);
        }
    }

    public async getSongById(videoId: string): Promise<Song | null> {
        try {
            const response: any = await this.youtube.videos.list({
                id: [videoId],
                part: ["snippet"]
            });

            if (!response.data?.items || response.data.items.length === 0) {
                this.logInfoMessage(`No video found for ID: "${videoId}"`, {details: response});
                return null;
            }

            const video = response.data.items[0];
            return {
                title: normalizeSongTitle(video.snippet.title),
                artists: [video.snippet.channelTitle],
                description: video.snippet.description,
                videoId: video.id
            }
        } catch (error) {
            // Silently handle when a song cannot be found
            this.logInfoMessage('Failed to get video by ID.', {cause:error})
            return null;
        }
    }

    private logInfoMessage(message: string, options: any = {}) {
        logger.info(message, {...options, source: "YouTube Music"});
    }

    private logDebugMessage(message: string, options: any = {}) {
        logger.debug(message, {...options, source: "YouTube Music"})
    }

    private throwError(ErrorType: new (...args: any[]) => Error, ...args: any[]): never {
        throw new ErrorType(...args);
    }
}

export const getYoutubeMusicService = async (
    user: string,
    vaultService: HCPVaultService
): Promise<YoutubeMusicClientService> => {
    logger.info(`Retrieving spotify service for user: ${user}`);
    const googleUserClient = await getGoogleUserClient(user, vaultService);
    const youtubeMusicService = new YoutubeMusicClientService(googleUserClient);
    await youtubeMusicService.initialize();
    return youtubeMusicService;
}
