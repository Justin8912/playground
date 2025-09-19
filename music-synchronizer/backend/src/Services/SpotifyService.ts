import { SpotifyApi, SimplifiedPlaylist, PlaylistedTrack, Track } from "@spotify/web-api-ts-sdk";
import {getSpotifyUserClient, SpotifyClient} from "./SpotifyClientFactory.js";
import { HCPVaultService } from "./VaultService.js";
import logger from "../Util/logger.js";
import {isSongMatch} from "../Util/titleMatcher.js";

interface GetPlaylistsWithoutSongs {
    id: string;
    description: string | null;
    images?: { url: string }[];
    title: string;
}

interface Song {
    title: string;
    artists: string[];
}

interface GetPlaylistsResponse extends GetPlaylistsWithoutSongs {
    songs: Song[];
}

export class SpotifyService {
    private spotifyClient: SpotifyClient;
    private spotifyApi: SpotifyApi;
    private playlists: GetPlaylistsResponse[] = [];

    constructor(
        spotifyClient: SpotifyClient,
    ) {
        this.spotifyClient = spotifyClient;
    }

    initialize = async () => {
        try {
            await this.spotifyClient.initialize();
            this.setSpotifyApi(this.spotifyClient.getSpotifyClient());
            // TODO: we will want to implement caching to avoid hitting rate limits
            // this.playlists = await this.getPlaylists();
            console.info("Spotify Service initialized successfully.");
        } catch (err) {
            throw new Error("Failed to initialize Spotify Service", { cause: err });
        }
    }

    private sleep = async () => {
        return new Promise(resolve => setTimeout(resolve, 1000));
    }
    private setSpotifyApi = (spotifyApi: SpotifyApi) => {
        this.spotifyApi = spotifyApi;
    }

    public getPlaylists = async (): Promise<GetPlaylistsResponse[]> => {
        try {
            console.info("Retrieving playlists from Spotify");
            const playlistIds = await this.getPlaylistIds();
            await this.sleep();
            const response = await Promise.all(playlistIds.map(async (playlist) => ({
                ...playlist,
                songs: await this.getSongs(playlist.id)
            })));
            await this.sleep();
            return response;
        } catch (err) {
            throw new Error("Failed to retrieve playlists from Spotify", { cause: err });
        }
    }

    private getSongs = async (playlistId: string): Promise<Song[]> => {
        try {
            const playlistItems = await this.spotifyApi.playlists.getPlaylistItems(playlistId);
            await this.sleep();
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

    public getPlaylistIds = async (): Promise<GetPlaylistsWithoutSongs[]> => {
        try {
            const playlists = await this.spotifyApi.currentUser.playlists.playlists(50);
            return playlists.items.map((playlist: SimplifiedPlaylist) => {
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
            const query = `${song.title} ${song.artists.join(' ')}`;
            
            // Search for the track
            const searchResults = await this.spotifyApi.search(query, ['track'], 'US', 1);
            await this.sleep();
            if (searchResults.tracks.items.length > 0) {
                const track: Track = searchResults.tracks.items[0];
                console.info(`Found song: "${track.name}" by ${track.artists.map(artist => artist.name).join(', ')} with URI: ${track.uri}`);
                if (isSongMatch(
                    {title: song.title, artist: song.artists.join(" ")},
                    {title: track.name, artist: track.artists.map(a=>a.name).join(" ")}
                )) {
                    return track.uri;
                } else {
                    console.info(`\`Found song: "${track.name}" by ${track.artists.map(artist => artist.name).join(', ')} does not match original song`)
                    return null
                }
            } else {
                console.info(`No song found for query: "${song.title}" by ${song.artists.join(', ')}`);
                return null;
            }
        } catch (err) {
            throw new Error(`Failed to search for song '${song.title}' by '${song.artists.join(', ')}'`, { cause: err });
        }
    }

    public addSongsToPlaylist = async (playlistName: string, songs: Song[]): Promise<boolean> => {
        try {
            console.info(`Adding ${songs.length} songs to playlist "${playlistName}"`);
            
            // First find the playlist by name
            const playlist = await this.getPlaylistByName(playlistName);
            if (!playlist) {
                throw new Error(`Playlist with name "${playlistName}" not found`);
            }
            
            // Get song URIs for all songs in parallel
            // const songUriPromises = songs.map(song => this.getSongUriByQuery(song));
            // const songUriResults = await Promise.all(songUriPromises);
            let songUriResults = []
            // Get song uris sequentially to avoid rate limiting
            for (const song of songs) {
                const searchResult = await this.getSongUriByQuery(song)
                songUriResults.push(searchResult);
                await this.sleep();
            }
            // Filter out null results and collect valid URIs
            const songUris: string[] = [];
            songUriResults.forEach((songUri, index) => {
                if (songUri) {
                    songUris.push(songUri);
                    console.info(`Found URI for "${songs[index].title}" by ${songs[index].artists.join(', ')}: ${songUri}`);
                } else {
                    console.warn(`Could not find URI for "${songs[index].title}" by ${songs[index].artists.join(', ')}, skipping...`);
                }
            });
            
            if (songUris.length === 0) {
                throw new Error(`No songs could be found on Spotify for the provided list`);
            }
            
            // Add all found songs to the playlist
            await this.spotifyApi.playlists.addItemsToPlaylist(playlist.id, songUris);
            
            console.info(`Successfully added ${songUris.length} out of ${songs.length} songs to playlist "${playlistName}"`);
            return true;
        } catch (err) {
            throw new Error(`Failed to add songs to playlist '${playlistName}'`, { cause: err });
        }
    }

    public getPlaylistByName = async (name: string): Promise<GetPlaylistsResponse | null> => {
        try {
            console.info(`Searching for playlist with name: ${name}`);

            let matchingPlaylist;
            if (this.playlists.length === 0) {
                this.playlists = await this.getPlaylists();
            }

            matchingPlaylist = this.playlists.find(playlist =>
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
    user: string,
    hcpVaultService: HCPVaultService
): Promise<SpotifyService> => {
    logger.info(`Retrieving spotify service for user: ${user}`);
    const spotifyClient = await getSpotifyUserClient(user, hcpVaultService);
    const spotifyService = new SpotifyService(spotifyClient);
    await spotifyService.initialize();
    return spotifyService;
}