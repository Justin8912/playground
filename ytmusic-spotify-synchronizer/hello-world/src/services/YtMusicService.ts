import {youtube_v3, google} from "googleapis";
import {GetPlaylistIdsResponse, GetPlaylistsResponse, Song} from "../model/YtMusic.js";
import logger from "../util/logger.js";
import puppeteer from 'puppeteer';

export class YtMusicService {
    private authClient: any;
    private youtube: youtube_v3.Youtube;
    public playlists: GetPlaylistsResponse[] = [];

    constructor(authClient) {
        this.authClient = authClient;
        this.youtube = google.youtube({version: "v3", auth: this.authClient});
    }

    public async initialize () {
        this.playlists = await this.getPlaylists();
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
                image: playlist.image,
                songs: await this.getSongs(playlist.id)
            }
        }).filter(res => Object.keys(res).length > 0))

    }

    getPlaylistIds = async (): Promise<GetPlaylistIdsResponse[]> => {
        let nextPageToken: string | undefined = "test";
        let result: GetPlaylistIdsResponse[] = [];
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
                    description: playlist.snippet.description,
                    image: {url: playlist?.snippet?.thumbnails.default.url}
                }
            )));

            nextPageToken = res?.data?.nextPageToken;
        }

        return result;
    }

    // videoScrapper = async (videoId: string): Promise<Song> => {
    //     if (!videoId) {
    //         logger.info("Video ID is not defined.");
    //         return {} as Song;
    //     }
    //     const browser = await puppeteer.launch({
    //         executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    //         headless: true
    //     });
    //     const page = await browser.newPage();
    //     const url = `https://www.youtube.com/watch?v=${videoId}`;
    //     await page.goto(url, { waitUntil: 'networkidle2' });
    //     const data = await page.evaluate(() => {
    //         const titleElement = document.querySelector('.yt-video-attribute-view-model__title');
    //         const artistElement = document.querySelector('.yt-video-attribute-view-model__subtitle');

    //         const title = titleElement ? titleElement.innerText : 'Title not found';
    //         const artists = artistElement ? artistElement.innerText : 'Artists not found';

    //         return { title, artists };
    //     });
    //     await browser.close();
    //     return {
    //         title: data.title,
    //         artists: data.artists.split(", ")
    //     }
    // }

    getSongs = async (playlistId: string): Promise<Song[]> => {
        let nextPageToken: string | undefined = "test";
        let result: any[] = [];
        while (nextPageToken) {
            let res = await this.youtube.playlistItems.list({
                playlistId: playlistId,
                part: ["snippet"],
                maxResults: 50
            });

            const songPromises = res.data?.items.map((item: youtube_v3.Schema$PlaylistItem) => {
                console.log("Here is a youtube song: ", item.snippet.resourceId.videoId);

                // return ({
                //     title:item.snippet?.title,
                //     artists: [item.snippet?.videoOwnerChannelTitle],
                //     description: item.snippet?.description,
                //     videoId: item?.snippet?.resourceId?.videoId
                // })
                return this.videoScrapper(item?.snippet?.resourceId?.videoId);
            });

            const songs = await Promise.all(songPromises);
            result.concat(songs);
            nextPageToken = res.data?.nextPageToken;
        }

        let videoScrapperPromises = result.map(async (song) => {
            logger.info(`Song: ${song.title} by ${song.artists.join(", ")} with id: ${song.videoId}`);
            const videoId = song.videoId;
            return this.videoScrapper(videoId);
        });

        return await Promise.all(videoScrapperPromises);
    }

    // For communicating between different applications
    // formatMetadata = (song) => {}

    getSongIdByQuery = async (query:string): Promise<void | string> => {
        let searchResult = await this.youtube.search.list(
            {
                part: ["snippet"],
                q: query,
                type: ["video"],
                maxResults: 1
            }
        )

        if (!searchResult?.data?.items) {
            return;
        }

        for (const video of searchResult?.data?.items) {
            console.log("Video: ", video)
            if (video?.id?.kind?.toLowerCase() === "youtube#video") {
                console.log("Video Found: ", video)
                return video?.id?.videoId;
            }
        }
    }

    createPlaylist = () => {}

    addSongToPlaylist = async (playlistId: string, videoId: string) => {
        return await this.youtube.playlistItems.insert({
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
    }

    addSongsToPlaylist = async (playlistId: string, videoIds: string[]): Promise<void> => {
        let responses = [];
        for (const videoId of videoIds) {
            let res = await this.addSongToPlaylist(playlistId, videoId);
            responses.push(res);
        }
        return;
    }

    getPlaylistByName = async (name: string): Promise<GetPlaylistsResponse | undefined> => {
        logger.info(`Google Service: Getting playlist id by name: ${name}`);
        if (this.playlists.length === 0 ) {
            this.playlists = await this.getPlaylists();
        }
        return this.playlists.find(playlist => playlist.title === name);
    }

    // This should be a later implementation, first pass should only be additive changes
    removeSongFromPlaylist = () => {}
}