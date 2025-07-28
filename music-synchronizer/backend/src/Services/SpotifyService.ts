import { SpotifyApi, SimplifiedPlaylist, PlaylistedTrack, Track } from "@spotify/web-api-ts-sdk";
import { SpotifyClient } from "./SpotifyClientFactory.js";
import { HCPVaultService } from "./VaultService.js";

interface GetPlaylistIdsResponse {
    id: string;
    description: string | null;
    images?: { url: string }[];
    title: string;
}

interface Song {
    title: string;
    artists: string[];
}

interface GetPlaylistsResponse extends GetPlaylistIdsResponse {
    songs: Song[];
}

export class SpotifyService {
    private spotifyClient: SpotifyClient;
    private spotifyApi: SpotifyApi;

    constructor(
        spotifyClient: SpotifyClient,
    ) {
        this.spotifyClient = spotifyClient;
    }

    initialize = async () => {
        try {
            await this.spotifyClient.initialize();
            this.setSpotifyApi(this.spotifyClient.getSpotifyClient());
            console.info("Spotify Service initialized successfully.");
        } catch (err) {
            throw new Error("Failed to initialize Spotify Service", { cause: err });
        }
    }

    private setSpotifyApi = (spotifyApi: SpotifyApi) => {
        this.spotifyApi = spotifyApi;
    }

    public getPlaylists = async (): Promise<GetPlaylistsResponse[]> => {
        try {
            console.info("Retrieving playlists from Spotify");
            const playlistIds = await this.getPlaylistIds();
            const response = await Promise.all(playlistIds.map(async (playlist) => ({
                ...playlist,
                songs: await this.getSongs(playlist.id)
            })));
            return response;
        } catch (err) {
            throw new Error("Failed to retrieve playlists from Spotify", { cause: err });
        }
    }

    private getSongs = async (playlistId: string): Promise<Song[]> => {
        try {
            const playlistItems = await this.spotifyApi.playlists.getPlaylistItems(playlistId);
            return playlistItems.items.map((song: PlaylistedTrack<Track>) => {
                return {
                    title: song?.track?.name || 'Unknown Title',
                    artists: song?.track?.artists?.map(artist => artist.name) || []
                };
            });
        } catch (err) {
            throw new Error(`Failed to retrieve songs for playlist ${playlistId}`, { cause: err });
        }
    }

    public getPlaylistIds = async (): Promise<GetPlaylistIdsResponse[]> => {
        try {
            const playlists = await this.spotifyApi.currentUser.playlists.playlists(50);
            return playlists.items.map((playlist: SimplifiedPlaylist) => {
                console.log("Here is the playlist: ", playlist);
                return {
                    id: playlist.id,
                    description: playlist.description,
                    images: playlist?.images?.map(image => ({ url: image.url })),
                    title: playlist.name
                };
            });
        } catch (err) {
            throw new Error("Failed to retrieve playlist IDs from Spotify", { cause: err });
        }
    }

    public createPlaylist = async (name: string, description?: string): Promise<string> => {
        try {
            console.info(`Creating new playlist: ${name}`);
            
            // Get the current user's ID
            const user = await this.spotifyApi.currentUser.profile();
            
            // Create the playlist
            const playlist = await this.spotifyApi.playlists.createPlaylist(user.id, {
                name: name,
                description: description || "",
                public: false
            });
            
            console.info(`Successfully created playlist: ${name} with ID: ${playlist.id}`);
            return playlist.id;
        } catch (err) {
            throw new Error(`Failed to create playlist '${name}'`, { cause: err });
        }
    }

    public getSongUriByQuery = async (song: Song): Promise<string | null> => {
        try {
            console.info(`Searching for song: "${song.title}" by ${song.artists.join(', ')}`);
            
            // Create search query string
            const query = `track:"${song.title}" artist:"${song.artists.join(' ')}"`;
            
            // Search for the track
            const searchResults = await this.spotifyApi.search(query, ['track'], 'US', 1);
            
            if (searchResults.tracks.items.length > 0) {
                const track = searchResults.tracks.items[0];
                console.info(`Found song: "${track.name}" by ${track.artists.map(artist => artist.name).join(', ')} with URI: ${track.uri}`);
                return track.uri;
            } else {
                console.info(`No song found for query: "${song.title}" by ${song.artists.join(', ')}`);
                return null;
            }
        } catch (err) {
            throw new Error(`Failed to search for song '${song.title}' by '${song.artists.join(', ')}'`, { cause: err });
        }
    }

    public addSongsToPlaylist = async () => {}

    public addSongToPlaylist = async (playlistId: string, songUri: string): Promise<boolean> => {
        try {
            console.info(`Adding song with URI "${songUri}" to playlist "${playlistId}"`);
            
            // Add the song to the playlist
            await this.spotifyApi.playlists.addItemsToPlaylist(playlistId, [songUri]);
            
            console.info(`Successfully added song with URI "${songUri}" to playlist "${playlistId}"`);
            return true;
        } catch (err) {
            throw new Error(`Failed to add song with URI '${songUri}' to playlist '${playlistId}'`, { cause: err });
        }
    }

    public getPlaylistByName = async (name: string): Promise<GetPlaylistsResponse | null> => {
        try {
            console.info(`Searching for playlist with name: ${name}`);
            
            const playlists = await this.getPlaylists();
            
            const matchingPlaylist = playlists.find(playlist => 
                playlist.title.toLowerCase() === name.toLowerCase()
            );
            
            if (matchingPlaylist) {
                console.info(`Found playlist: ${matchingPlaylist.title} with ID: ${matchingPlaylist.id}`);
                return matchingPlaylist;
            } else {
                console.info(`No playlist found with name: ${name}`);
                return null;
            }
        } catch (err) {
            throw new Error(`Failed to find playlist by name '${name}'`, { cause: err });
        }
    }

    public removeSongFromPlaylist = async () => {}
}

export const getSpotifyService = async (
    spotifyClient: SpotifyClient
): Promise<SpotifyService> => {
    const spotifyService = new SpotifyService(spotifyClient);
    await spotifyService.initialize();
    return spotifyService;
}