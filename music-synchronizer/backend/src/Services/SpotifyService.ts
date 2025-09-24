import { SpotifyApi, SimplifiedPlaylist, PlaylistedTrack, Track } from "@spotify/web-api-ts-sdk";
import {getSpotifyUserClient, SpotifyClient} from "./SpotifyClientFactory.js";
import { HCPVaultService } from "./VaultService.js";
import logger from "../Util/logger.js";
import {doSongsMatch} from "../Util/titleMatcher.js";
import {MusicServiceInterface} from "./MusicServiceInterface.js";
import {
    GetPlaylistsResponse,
    Song,
    PlaylistWithoutSongs
} from "../Model/MusicService.js"
import {sleep} from "../Util/sleep.js";

export class SpotifyService implements MusicServiceInterface {
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

    private setSpotifyApi = (spotifyApi: SpotifyApi) => {
        this.spotifyApi = spotifyApi;
    }

    public getPlaylists = async (): Promise<GetPlaylistsResponse[]> => {
        try {
            console.info("Retrieving playlists from Spotify");
            const playlistIds = await this.getPlaylistsWithoutSongs();
            await sleep();
            const response = await Promise.all(playlistIds.map(async (playlist: PlaylistWithoutSongs) => ({
                ...playlist,
                songs: await this.getSongs(playlist.id)
            })));
            await sleep();
            return response;
        } catch (err) {
            throw new Error("Failed to retrieve playlists from Spotify", { cause: err });
        }
    }

    private getSongs = async (playlistId: string): Promise<Song[]> => {
        try {
            const playlistItems = await this.spotifyApi.playlists.getPlaylistItems(playlistId);
            await sleep();
            return playlistItems.items.map((song: PlaylistedTrack<Track>) => {
                return this.mapTrackToSong(song.track);
            });
        } catch (err) {
            throw new Error(`Failed to retrieve songs for playlist ${playlistId}`, { cause: err });
        }
    }

    public getPlaylistsWithoutSongs = async (): Promise<PlaylistWithoutSongs[]> => {
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

    public getSongByQuery = async (query: string): Promise<Track | null> => {
        try {
            console.info(`Searching for song: "${query}"`);
            const searchResults = await this.spotifyApi.search(query, ['track'], 'US', 1);
            await sleep();
            if (searchResults?.tracks?.items?.length > 0) {
                const track: Track = searchResults.tracks?.items[0] as Track;
                console.info(`Found song: "${track.name}" by ${track.artists.map(artist => artist.name).join(', ')} with URI: ${track.uri}`);
                return track
            } else {
                console.info(`No song found for query: "${query}"`);
                return null;
            }
        } catch (err) {
            throw new Error(`Failed to search for song '${query}'`, { cause: err });
        }
    }

    public getSong = async (song: Song): Promise<Song | null> => {
        const query = `${song.title} ${song.artists.join(' ')}`;
        const spotifyTrack: Track = (await this.getSongByQuery(query)) as Track;

        if (!spotifyTrack) {
            console.error(`No track found for query ${query}`);
            return null;
        } else {
            return {
                title: spotifyTrack.name,
                artists: spotifyTrack.artists.map(artist => artist.name),
                videoId: spotifyTrack.uri
            }
        }
    }

    public addSongsToPlaylist = async (playlistName: string, songs: Song[]): Promise<Song[]> => {
        try {
            const failedSongAdds = [];
            console.info(`Adding ${songs.length} songs to playlist "${playlistName}"`);

            const playlist = await this.getPlaylistByName(playlistName);
            if (!playlist) {
                throw new Error(`Playlist with name "${playlistName}" not found`);
            }

            let songUriResults = []
            for (const song of songs) {
                const searchResult = await this.getSong(song)
                if (!searchResult) {
                    failedSongAdds.push(song);
                } else {
                    if (doSongsMatch(song, searchResult)) {
                        songUriResults.push(searchResult.videoId);
                    } else {
                        console.warn(`Song found does not strongly match the query\n\tFound song: ${searchResult.title} ${searchResult.artists.join(", ")}\n\tRequested song: ${song.title} ${song.artists.join(", ")}`);
                        failedSongAdds.push(song);
                    }
                }
                await sleep();
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
                console.error(`No songs could be found on Spotify for the provided list`);
                return [];
            } else {
                // Add all found songs to the playlist
                await this.spotifyApi.playlists.addItemsToPlaylist(playlist.id, songUris);

                console.info(`Successfully added ${songUris.length} out of ${songs.length} songs to playlist "${playlistName}"`);
                return failedSongAdds;
            }
        } catch (err) {
            throw new Error(`Failed to add songs to playlist '${playlistName}'`, { cause: err });
        }
    }

    public async addUserApprovedSongsToPlaylist(playlistName: string, songs: Song[]): Promise<Song[]> {
        try {
            const failedSongAdds: Song[] = [];
            console.info(`Adding ${songs.length} songs to playlist "${playlistName}"`);

            const playlist = await this.getPlaylistByName(playlistName);
            if (!playlist) {
                throw new Error(`Playlist with name "${playlistName}" not found`);
            }

            let songUris: string[] = songs.map(song => song.videoId) as string[];

            if (songUris.length === 0) {
                console.error(`No songs could be found on Spotify for the provided list`);
                return [] as Song[];
            } else {
                // Add all found songs to the playlist
                await this.spotifyApi.playlists.addItemsToPlaylist(playlist.id, songUris);

                console.info(`Successfully added ${songUris.length} out of ${songs.length} songs to playlist "${playlistName}"`);
                return failedSongAdds;
            }
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
            console.log("Playlists: ", this.playlists.map(p=>p.title));
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

    public getSongById = async (songId: string): Promise<Song | null> => {
        try {
            if (!songId) return null;
            const track: Track = await this.spotifyApi.tracks.get(songId);
            if (track) return this.mapTrackToSong(track);
            return null;
        } catch(err) {
            console.error("There was an error retrieving song by ID from Spotify", err);
            return null;
        }
    }

    public mapTrackToSong = (track: Track): Song => {
        return {
            title: track.name,
            artists: track.artists.map(artist => artist.name),
            videoId: track.uri
        }
    }
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