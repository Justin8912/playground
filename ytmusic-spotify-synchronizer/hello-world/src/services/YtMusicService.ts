import {youtube_v3, google} from "googleapis";
import {GetPlaylistIdsResponse, GetPlaylistsResponse, Song} from "../model/YtMusic.js";

export class YtMusicService {
    private authClient: any;
    private youtube: youtube_v3.Youtube;

    constructor(authClient) {
        this.authClient = authClient;
        this.youtube = google.youtube({version: "v3", auth: this.authClient});
    }

    private async refreshAccessToken() {
        const tokens = await this.authClient.refreshAccessToken();
        const credentials = tokens.credentials;
        this.authClient.setCredentials({
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token,
        });
    }

    private async ensureValidToken() {
        const tokenInfo = this.authClient.credentials;
        const currentTime = Math.floor(Date.now() / 1000);
        if (tokenInfo.expiry_date && tokenInfo.expiry_date < currentTime) {
            await this.refreshAccessToken();
        }
    }

    getPlaylists = async (): Promise<GetPlaylistsResponse[]> => {
        await this.ensureValidToken();
        return await Promise.all((await this.getPlaylistIds()).map(async (playlist: GetPlaylistIdsResponse) => {
            return {
                id: playlist.id,
                title: playlist.title,
                description: playlist.description,
                songs: await this.getSongs(playlist.id)
            }
        }));
    }

    getPlaylistIds = async (): Promise<GetPlaylistIdsResponse[]> => {
        let nextPageToken: string | undefined = "test";
        let result: string[] = [];
        while (nextPageToken) {
            let res = await this.youtube.playlists.list({
                part: ["id", "snippet"],
                mine: true,
                pageToken: nextPageToken === "test" ? undefined : nextPageToken,
                maxResults: 50
            });

            result = result.concat(res?.data?.items.map((playlist) => (
                {
                    id:playlist.id,
                    title: playlist.snippet.title,
                    description: playlist.snippet.description
                }
            )));
            nextPageToken = res?.data?.nextPageToken;
        }

        return result;
    }

    getSongs = async (playlistId: string): Promise<Song[]> => {
        let nextPageToken: string | undefined = "test";
        let result: {title:string}[] = [];
        while (nextPageToken) {
            let res = await this.youtube.playlistItems.list({
                playlistId: playlistId,
                part: ["snippet"],
                maxResults: 50
            });

            result = result.concat(res.data?.items.map((item) => ({
                title:item.snippet.title,
                description: item.snippet.description
            })));
            nextPageToken = res.data?.nextPageToken;
        }
        return result;
    }

    // For communicating between different applications
    formatMetadata = (song) => {}

    searchForSong = () => {}

    createPlaylist = () => {}
    addSongToPlaylist = () => {}

    // This should be a later implementation, first pass should only be additive changes
    removeSongFromPlaylist = () => {}
}