import { youtube_v3, google } from "googleapis";
import {
    GetPlaylistsResponse, 
    GetPlaylistsWithoutSongs,
    Song
} from "../Model/MusicService.js"
import {getGoogleUserClient, GoogleUserClient} from "./GoogleClientFactory.js";
import {HCPVaultService} from "./VaultService.js";
import logger from "../Util/logger.js";
import {doSongsMatch, normalizeSongTitle} from "../Util/titleMatcher.js";
import {MusicServiceInterface} from "./MusicServiceInterface.js";

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
            console.log(`YouTube Music Client initialized with ${this.playlists.length} playlists`);
        } catch (error) {
            throw new Error('Failed to initialize the YoutubeMusicClient: ' + error);
        }
    }

    private sleep = async () => {
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    public async getPlaylists(): Promise<GetPlaylistsResponse[]> {
        try {
            const playlistIds = await this.getPlaylistIds();
            const playlistPromises = playlistIds.map((playlist: GetPlaylistsWithoutSongs) => {
                if (!playlist.description?.toLowerCase().includes("music")) return
                return this.getSongs(playlist.id).then(songs => ({
                    id: playlist.id,
                    title: playlist.title,
                    description: playlist.description,
                    image: playlist.image,
                    songs: songs
                })).catch(error => {
                    console.warn(`Failed to get songs for playlist "${playlist.title}":`, error);
                    // Return playlist without songs rather than failing completely
                    return {
                        id: playlist.id,
                        title: playlist.title,
                        description: playlist.description,
                        image: playlist.image,
                        songs: []
                    };
                })
            }).filter(playlist => !!playlist);

            const populatedPlaylists = await Promise.all(playlistPromises);
            const validPlaylists = populatedPlaylists.filter(playlist => !!playlist);
            
            console.log(`Retrieved ${validPlaylists.length} populated playlists`);
            return validPlaylists;
        } catch (error) {
            throw new Error('Failed to get populated YouTube Music playlists: ' + error);
        }
    }

    public async getPlaylistIds(): Promise<GetPlaylistsWithoutSongs[]> {
        try {            
            let nextPageToken: string | undefined = undefined;
            let result: GetPlaylistsWithoutSongs[] = [];
            
            while (nextPageToken !== null) {
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
                    })).filter((playlist: any) => playlist.description.includes("music"));
                    
                    result = result.concat(playlistData);
                }

                nextPageToken = response.data?.nextPageToken || null;
            }

            console.log(`Retrieved ${result.length} playlist IDs`);
            return result;
        } catch (error) {
            throw new Error('Failed to get YouTube Music playlist IDs: ' + error);
        }
    }

    public async getSongs(playlistId: string): Promise<Song[]> {
        try {            
            let nextPageToken: string | undefined = undefined;
            let result: Song[] = [];
            
            while (nextPageToken !== null) {
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

                nextPageToken = response.data?.nextPageToken || null;
            }

            console.log(`Retrieved ${result.length} songs from playlist ${playlistId}`);
            return result;
        } catch (error) {
            throw new Error('Failed to get songs from YouTube Music playlist: ' + error);
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

            await this.sleep();

            if (!searchResult?.data?.items || searchResult.data.items.length === 0) {
                console.log(`No videos found for query: "${query}"`);
                return null;
            }

            for (const video of searchResult.data.items) {
                if (video?.id?.kind?.toLowerCase() === "youtube#video") {
                    const videoId = video.id.videoId;
                    console.log(`Found video "${video.snippet?.title}" with ID: ${videoId} for query: "${query}"`);
                    return {
                        title: video.snippet.title,
                        artists: [video.snippet.channelTitle],
                        description: video.snippet.description,
                        videoId
                    }
                }
            }

            console.log(`No valid YouTube videos found for query: "${query}"`);
            return null;
        } catch (error) {
            throw new Error('Failed to search for YouTube Music video: ' + error);
        }
    }

    public async createPlaylist(title: string, description?: string): Promise<string> {
        try {            
            const response: any = await this.youtube.playlists.insert({
                part: ["snippet", "status"],
                requestBody: {
                    snippet: {
                        title: title,
                        description: description || `Created by YouTube Music Client on ${new Date().toISOString()}`
                    },
                    status: {
                        privacyStatus: "private" // Default to private, can be changed later
                    }
                }
            });

            const playlistId = response.data?.id;
            if (!playlistId) {
                throw new Error('No playlist ID returned from YouTube API');
            }

            console.log(`Created playlist "${title}" with ID: ${playlistId}`);
            return playlistId;
        } catch (error) {
            throw new Error('Failed to create YouTube Music playlist: ' + error);
        }
    }

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

            await this.sleep();

            console.log(`Added video ${videoId} to playlist ${playlistId}`);
            return response;
        } catch (error) {
            throw new Error('Failed to add song to YouTube Music playlist: ' + error);
        }
    }

    // Maybe have a public facing method that allows adding multiple songs by name at once
    public async addSongsToPlaylist(playlistName: string, songs: Song[]): Promise<Song[]> {
        try {
            const failedSongAdds: Song[] = [];
            const responses = [];
            const playlistId = (await this.getPlaylistByName(playlistName))?.id;

            if (!playlistId) {
                throw new Error(`Playlist with name "${playlistName}" not found`);
            }

            for (const song of songs) {
                try {
                    const video = await this.getSong(song);
                    if (video) {
                        if (doSongsMatch(song, video)) {
                            const response = await this.addSongToPlaylist(playlistId, video.videoId as string);
                            responses.push(response);
                        } else {
                            console.warn(`Song found does not strongly match the query\n\tFound song: ${video.title} ${video.artists.join(", ")}\n\tRequested song: ${song.title} ${song.artists.join(", ")}`);
                            failedSongAdds.push(song);
                        }
                    } else {
                        console.warn(`The following song was not found in youtube:\n\tRequested song: ${song.title} ${song.artists.join(", ")}`);
                        failedSongAdds.push(song);
                    }
                } catch (error) {
                    // Continue with other songs rather than failing completely
                    console.warn(`Failed to add video for ${song.title} to playlist ${playlistId}:`, error);
                    failedSongAdds.push(song);
                }
            }

            console.log(`Successfully added ${responses.length} out of ${songs.length} songs to playlist ${playlistId}`);
            return failedSongAdds;
        } catch (error) {
            throw new Error('Failed to add songs to YouTube Music playlist: ' + error);
        }
    }

    public async getPlaylistByName(name: string): Promise<GetPlaylistsResponse | null> {
        try {
            console.log(`Searching for playlist by name: "${name}"`);
            
            if (this.playlists.length === 0) {
                console.log('Playlists cache is empty, loading playlists...');
                this.playlists = await this.getPlaylists();
            }
            const foundPlaylist = this.playlists.find(
                playlist => playlist.title.toLowerCase() === name.toLowerCase()
            );
            if (foundPlaylist) {
                console.log(`Found playlist "${name}" with ID: ${foundPlaylist.id}`);
                return foundPlaylist;
            } else {
                console.log(`No playlist found with name: "${name}"`);
                return null;
            }
        } catch (error) {
            throw new Error('Failed to get YouTube Music playlist by name: ' + error);
        }
    }

    // Update to remove a song from a playlist based on the song title instead maybe?
    public async removeSongFromPlaylist(playlistId: string, videoId: string): Promise<void> {
        try {            
            // First, we need to find the playlist item ID for this video in the playlist
            let nextPageToken: string | undefined = undefined;
            let playlistItemId: string | undefined = undefined;
            
            while (nextPageToken !== null && !playlistItemId) {
                const response: any = await this.youtube.playlistItems.list({
                    playlistId: playlistId,
                    part: ["id", "snippet"],
                    pageToken: nextPageToken,
                    maxResults: 50
                });

                if (response.data?.items) {
                    console.log(response.data.snippet);
                    const foundItem = response.data.items.find((item: any) => 
                        item.snippet?.resourceId?.videoId === videoId
                    );
                    
                    if (foundItem) {
                        playlistItemId = foundItem.id;
                        break;
                    }
                }

                nextPageToken = response.data?.nextPageToken || null;
            }

            if (!playlistItemId) {
                console.log(`Video ${videoId} not found in playlist ${playlistId}`);
                return;
            }

            // Remove the playlist item
            await this.youtube.playlistItems.delete({
                id: playlistItemId
            });

            console.log(`Removed video ${videoId} from playlist ${playlistId}`);
        } catch (error) {
            throw new Error('Failed to remove song from YouTube Music playlist: ' + error);
        }
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
