import {AccessToken, PlaylistedTrack, SimplifiedPlaylist, SpotifyApi, Track} from "@spotify/web-api-ts-sdk";
import logger from "../util/logger.js";
import {GetPlaylistIdsResponse, GetPlaylistsResponse, Song} from "../model/YtMusic.js";
import {HCPVaultService} from "./VaultService.js";
import {formatSearchQuery} from "../Handlers/Authorization/util/formatSearchQuery.js";

export class SpotifyService{
    private spotifyClient: SpotifyApi;
    private userId: string;
    private playlists: GetPlaylistsResponse[] = [];
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly userRefreshToken: string;
    private readonly setSpotifyCredentials: (accessToken: AccessToken)=>Promise<void>;

    constructor(
        spotifyClient: SpotifyApi,
        clientId: string,
        clientSecret: string,
        userRefreshToken: string,
        setSpotifyCredentials: (accessToken: AccessToken)=>Promise<void>
    ) {
        this.spotifyClient = spotifyClient;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.userRefreshToken = userRefreshToken;
        this.setSpotifyCredentials = setSpotifyCredentials;
    }

    initialize = async () => {
        if (this.userRefreshToken) {
            await this.refreshAccessToken();
            await this.getPlaylists();
        } else {
            logger.info("Spotify API Initialized as client only. User will need to be authenticated.");
        }
    }

    refreshAccessToken = async () => {
        logger.info("Refreshing access token for user");
        const url = "https://accounts.spotify.com/api/token";
        const payload = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(`${this.clientId}:${this.clientSecret}`)
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: this.userRefreshToken,
                client_id: this.clientId
            }),
        }
        const body = await fetch(url, payload);
        const response = await body.json();

        const accessToken = {
            access_token: response.access_token,
            token_type: response.token_type,
            expires_in: response.expires_in,
            refresh_token: this.userRefreshToken
        }

        await this.setSpotifyCredentials(accessToken);
        this.spotifyClient = SpotifyApi.withAccessToken(this.clientId, accessToken);
    }

    getUserId = async (): Promise<string> => {
        const user = await this.spotifyClient.currentUser.profile();
        return user.id;
    }

    getPlaylists = async (): Promise<Awaited<GetPlaylistsResponse>[]> => {
        logger.info("Retrieving playlists from Spotify");
        const playlistIds = await this.getPlaylistIds();
        const response = await Promise.all(playlistIds.map(async (playlist) => ({
            ...playlist,
            songs: await this.getSongs(playlist.id)
        })));
        this.playlists = response;
        return response;
    }

    getPlaylistIds = async (): Promise<GetPlaylistIdsResponse[]> => {
        return (await this.spotifyClient.currentUser.playlists.playlists(50))?.items
            .map((playlist: SimplifiedPlaylist) => {
                console.log("Here is the playlist: ", playlist);
                return {
                    id: playlist.id,
                    description: playlist.description,
                    images: playlist?.images?.map(image=>({url:image.url})),
                    title: playlist.name
                }
            });
    }

    getSongs = async (playlistId: string): Promise<Song[]> => {
        return (await this.spotifyClient.playlists.getPlaylistItems(playlistId))?.items
            .map((song: PlaylistedTrack<Track>) => {
                return {
                    title: song?.track?.name,
                    artists: song?.track?.artists?.map(artist=>artist.name)
                }
            })
    }

    // For communicating between different applications
    formatMetadata = (song) => {}

    // This will return the songId of the first result
    getSongUriByQuery = async (song: Song): Promise<string | undefined> => {
        // Maybe I can come back and filter by the artists
        //   use res.tracks.items[x].artists[0].name
        let query = formatSearchQuery(song);
        logger.info(`Beginning search for song (in spotify API): ${query}`);
        let res = await this.spotifyClient.search<Track>(query, ["track"]);
        if (res?.tracks?.items[0]?.uri){
            return (res)?.tracks?.items[0]?.uri;
        }

        // Alternative logic, this is done in case the youtube title include the artist name already and the query
        //   string gets too long to effectively search spotify.
        res = await this.spotifyClient.search<Track>(song.title, ["track"]);
        if (res?.tracks?.items[0]?.uri) {
            return (res)?.tracks?.items[0]?.uri;
        }
        logger.info(`Song ${query} was not found.`)
        return undefined;

    }

    createPlaylist = () => {}

    addSongsToPlaylist = async (playlistId: string, songUris: string[]): Promise<void> => {
        logger.info(`Adding songs [${songUris.join(', ')}] to playlist ${playlistId}`);
        await this.spotifyClient.playlists.addItemsToPlaylist(playlistId, songUris);
    }

    getPlaylistByName = async (name: string): Promise<GetPlaylistsResponse | undefined> => {
        logger.info(`Spotify Service: Getting playlist id by name: ${name}`);
        if (this.playlists.length === 0 ) {
            this.playlists = await this.getPlaylists();
        }
        return this.playlists.find(playlist => playlist.title.toLowerCase() === name.toLowerCase());
    }

    // This should be a later implementation, first pass should only be additive changes
    removeSongFromPlaylist = () => {}
}