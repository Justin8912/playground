import { youtube_v3, google } from "googleapis";
import {
    GetPlaylistsResponse, 
    GetPlaylistIdsResponse,
    Song
} from "../Model/MusicService.js"

export class YoutubeMusicClientService {
    private authClient: any;
    private youtube: youtube_v3.Youtube;
    public playlists: GetPlaylistsResponse[] = [];

    constructor(authClient: any) {
        this.authClient = authClient;
        this.youtube = google.youtube({ version: "v3", auth: this.authClient });
    }

    public async initialize(): Promise<void> {
        try {
            await this.ensureValidToken();
            this.playlists = await this.getPopulatedPlaylists();
            console.log(`YouTube Music Client initialized with ${this.playlists.length} playlists`);
        } catch (error) {
            throw new Error('Failed to initialize the YoutubeMusicClient: ' + error);
        }
    }

    private async refreshAccessToken(): Promise<void> {
        try {
            const tokens = await this.authClient.refreshAccessToken();
            const credentials = tokens.credentials;
            
            this.authClient.setCredentials({
                access_token: credentials.access_token,
                refresh_token: credentials.refresh_token,
            });
            
            console.log('Access token refreshed successfully');
        } catch (error) {
            throw new Error('Failed to refresh YouTube Music access token: ' + error);
        }
    }

    private async ensureValidToken(): Promise<void> {
        try {
            const tokenInfo = this.authClient.credentials;
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (!tokenInfo || !tokenInfo.expiry_date || tokenInfo.expiry_date < currentTime) {
                console.log('Token expired or missing, refreshing...');
                await this.refreshAccessToken();
            }
        } catch (error) {
            throw new Error('Failed to ensure valid YouTube Music token: ' + error);
        }
    }

    public async getPopulatedPlaylists(): Promise<GetPlaylistsResponse[]> {
        try {
            const playlistIds = await this.getPlaylistIds();
            const playlistPromises = playlistIds.map((playlist: GetPlaylistIdsResponse) => {
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
                });
            });

            const populatedPlaylists = await Promise.all(playlistPromises);
            const validPlaylists = populatedPlaylists.filter(playlist => !!playlist);
            
            console.log(`Retrieved ${validPlaylists.length} populated playlists`);
            return validPlaylists;
        } catch (error) {
            throw new Error('Failed to get populated YouTube Music playlists: ' + error);
        }
    }

    public async getPlaylistIds(): Promise<GetPlaylistIdsResponse[]> {
        try {            
            let nextPageToken: string | undefined = undefined;
            let result: GetPlaylistIdsResponse[] = [];
            
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
                            title: title,
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

    public async getSongIdByQuery(query: string): Promise<void | string> {
        try {
            const searchResult: any = await this.youtube.search.list({
                part: ["snippet"],
                q: query,
                type: ["video"],
                maxResults: 1
            });

            if (!searchResult?.data?.items || searchResult.data.items.length === 0) {
                console.log(`No videos found for query: "${query}"`);
                return undefined;
            }

            for (const video of searchResult.data.items) {
                if (video?.id?.kind?.toLowerCase() === "youtube#video") {
                    const videoId = video.id.videoId;
                    console.log(`Found video "${video.snippet?.title}" with ID: ${videoId} for query: "${query}"`);
                    return videoId;
                }
            }

            console.log(`No valid YouTube videos found for query: "${query}"`);
            return undefined;
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
            await this.ensureValidToken();
            
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

            console.log(`Added video ${videoId} to playlist ${playlistId}`);
            return response;
        } catch (error) {
            throw new Error('Failed to add song to YouTube Music playlist: ' + error);
        }
    }

    // Maybe have a public facing method that allows adding multiple songs by name at once
    public async addSongsToPlaylist(playlistId: string, videoIds: string[]): Promise<void> {
        try {
            const responses = [];
            for (const videoId of videoIds) {
                try {
                    const response = await this.addSongToPlaylist(playlistId, videoId);
                    responses.push(response);
                } catch (error) {
                    console.warn(`Failed to add video ${videoId} to playlist ${playlistId}:`, error);
                    // Continue with other songs rather than failing completely
                }
            }

            console.log(`Successfully added ${responses.length} out of ${videoIds.length} songs to playlist ${playlistId}`);
        } catch (error) {
            throw new Error('Failed to add songs to YouTube Music playlist: ' + error);
        }
    }

    public async getPlaylistByName(name: string): Promise<GetPlaylistsResponse | undefined> {
        try {
            console.log(`Searching for playlist by name: "${name}"`);
            
            if (this.playlists.length === 0) {
                console.log('Playlists cache is empty, loading playlists...');
                this.playlists = await this.getPopulatedPlaylists();
            }
            
            const foundPlaylist = this.playlists.find(playlist => playlist.title === name);
            
            if (foundPlaylist) {
                console.log(`Found playlist "${name}" with ID: ${foundPlaylist.id}`);
                return foundPlaylist;
            } else {
                console.log(`No playlist found with name: "${name}"`);
                return undefined;
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
