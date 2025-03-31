import {AccessToken, PlaylistedTrack, SimplifiedPlaylist, SpotifyApi, Track} from "@spotify/web-api-ts-sdk";
import logger from "../util/logger.js";
import {GetPlaylistIdsResponse, GetPlaylistsResponse, Song} from "../model/YtMusic.js";
import {HCPVaultService} from "./VaultService.js";

export class SpotifyService{
    private spotifyClient: SpotifyApi;
    private userId: string;
    private playlists: GetPlaylistsResponse[] = [];
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly userRefreshToken: string;
    private readonly getUser: ()=>string;
    private readonly setVaultParameter: (name: string, data:Record<string, any>)=>Promise<void>;

    constructor(
        spotifyClient: SpotifyApi,
        clientId: string,
        clientSecret: string,
        userRefreshToken: string,
        getUser: () => string,
        setVaultParameter: (name: string, data:Record<string, any>)=>Promise<void>
    ) {
        this.spotifyClient = spotifyClient;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.userRefreshToken = userRefreshToken;
        this.getUser = getUser;
        this.setVaultParameter = setVaultParameter;
    }

    initialize = async () => {
        if (this.userRefreshToken) {
            await this.refreshAccessToken();
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
        const vaultStorage = {
            spotifyAccessToken: response.access_token,
            spotifyRefreshToken: response.refreshToken,
            spotifyTokenType: response.token_type,
            spotifyTokenExpiresIn: response.expires
        }

        await this.setVaultParameter(this.getUser(), vaultStorage);
        const accessToken = {
            access_token: response.access_token,
            refresh_token: response.refreshToken,
            token_type: response.token_type,
            expires_in: response.expires
        }

        this.spotifyClient = SpotifyApi.withAccessToken(this.clientId, accessToken);
    }

    getUserId = async (): Promise<string> => {
        const user = await this.spotifyClient.currentUser.profile();
        return user.id;
    }

    getPlaylists = async (): Promise<Awaited<GetPlaylistsResponse>[]> => {
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
                    title: song.track.name,
                    artists: song.track.artists.map(artist=>artist.name)
                }
            })
    }

    // For communicating between different applications
    formatMetadata = (song) => {}

    searchForSong = async (query: string) => {
        console.log("Beginning search for song: ", query);
        return await this.spotifyClient.search(query, ["track"]);
    }

    createPlaylist = () => {}

    addSongToPlaylist = async (playlistId: string, songUri: string): Promise<void> => {
        await this.spotifyClient.playlists.updatePlaylistItems(playlistId, {uris:[songUri]});
    }

    getPlaylistIdByName = async (name: string): Promise<string | undefined> => {
        logger.info(`Spotify Service: Getting playlist id by name: ${name}`);
        await this.refreshAccessToken();
        if (this.playlists.length === 0 ) {
            this.playlists = await this.getPlaylists();
        }
        const res = this.playlists.find(playlist => playlist.title === name);
        logger.info(JSON.stringify(res));
        return res?.id;
    }

    // This should be a later implementation, first pass should only be additive changes
    removeSongFromPlaylist = () => {}
}