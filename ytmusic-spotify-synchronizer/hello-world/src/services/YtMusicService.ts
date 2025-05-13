import {youtube_v3, google} from "googleapis";
import {GetPlaylistIdsResponse, GetPlaylistsResponse, Song} from "../model/MusicTypes.js";
import logger from "../util/logger.js";
import puppeteer from 'puppeteer';

export class YtMusicService {
    private authClient: any;
    private youtube: youtube_v3.Youtube;
    public playlists: GetPlaylistsResponse[] = [];
    private songCache = {};

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
        logger.info("Getting user playlists");
        await this.ensureValidToken();
        let playlists = await Promise.all((await this.getPlaylistIds()).map(async (playlist: GetPlaylistIdsResponse) => {
            return {
                id: playlist.id,
                title: playlist.title,
                description: playlist.description,
                image: playlist.image,
                songs: await this.getSongs(playlist.id)
            }
        }));

        return playlists.filter(playlist => {
            return playlist?.description?.toLowerCase() === "music";
        })
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

    videoScrapper = async (videoId: string | undefined | null): Promise<Song> => {
        if (!videoId) {
            logger.info("Video ID is not defined.");
            return {} as Song;
        }
        
        // Configure puppeteer for both local and Docker environments
        const launchOptions: any = {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        };
        
        // Use environment variable for executable path if available (used in Docker)
        if (process.env.PUPPETEER_EXECUTABLE_PATH) {
            logger.info(`Using Chrome at: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
            launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        }
        
        const browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        
        // Add more logging for debugging purposes
        logger.info(`Navigating to: ${url}`);
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            
            // Add page content logging for debugging
            const pageContent = await page.content();
            logger.debug(`Page length: ${pageContent.length} characters`);
            
            const data = await page.evaluate(() => {
                const titleElement = document.querySelector('.yt-video-attribute-view-model__title');
                const artistElement = document.querySelector('.yt-video-attribute-view-model__subtitle');

                const title = titleElement ? titleElement.innerText : 'Title not found';
                const artists = artistElement ? artistElement.innerText : 'Artists not found';

                return { title, artists };
            });
            await browser.close();
            return {
                title: data.title,
                artists: data.artists.split(", ")
            }
        } catch (error) {
            logger.error(`Error scraping video ${videoId}: ${error.message}`);
            await browser.close();
            return {
                title: `Failed to load video ${videoId}`,
                artists: ['Unknown']
            };
        }
    }

    getSongs = async (playlistId: string): Promise<Song[]> => {
        let nextPageToken: string | undefined = "test";
        let result: any[] = [];
        while (nextPageToken) {
            let res = await this.youtube.playlistItems.list({
                playlistId: playlistId,
                part: ["snippet"],
                maxResults: 50
            });

            const songPromises = res.data?.items?.map((item: youtube_v3.Schema$PlaylistItem) => {
                console.log("Here is a youtube song: ", item?.snippet?.resourceId?.videoId);

                // return ({
                //     title:item.snippet?.title,
                //     artists: [item.snippet?.videoOwnerChannelTitle],
                //     description: item.snippet?.description,
                //     videoId: item?.snippet?.resourceId?.videoId
                // })
                return this.videoScrapper(item?.snippet?.resourceId?.videoId);
            });

            if (songPromises) {
                const songs = await Promise.all(songPromises);
                result.concat(songs);
            }
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
    formatMetadata = (song) => {}

    getSongIdByQuery = async (query:string): Promise<void | string> => {
        let searchResult = await this.youtube.search.list(
            {
                part: ["snippet"],
                q: query,
                type: ["video"],
                maxResults: 5
            }
        )

        if (!searchResult?.data?.items) {
            return;
        }

        for (const video of searchResult?.data?.items) {
            if (video?.id?.kind?.toLowerCase() === "youtube#video") {
                if (video?.id?.videoId) {
                    // @ts-ignore
                    this.songCache[video?.id?.videoId] = query;
                    return video?.id?.videoId;
                }
            }
        }
    }

    createPlaylist = () => {}

    addSongToPlaylist = async (playlistId: string, videoId: string) => {
        try {
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
        } catch (error) {
            // @ts-ignore
            const song = this.songCache[videoId];
            const playlistTitle = this.playlists.filter(
                playlist => playlist.id === playlistId
            )[0].title;
            logger.info(`Unable to add ${song} to ${playlistTitle}`);
        }
    }

    addSongsToPlaylist = async (playlistId: string, videoIds: string[]): Promise<void> => {
        logger.info("Adding songs to playlist");
        let responses = [];
        for (const videoId of videoIds) {
            let res = await this.addSongToPlaylist(playlistId, videoId);
            responses.push(res);
        }
        logger.info("Songs added successfully");
        return;
    }

    getPlaylistByName = async (name: string): Promise<GetPlaylistsResponse | undefined> => {
        logger.info(`Google Service: Getting playlist id by name: ${name}`);
        return this.playlists.find(playlist => playlist.title === name);
    }

    // This should be a later implementation, first pass should only be additive changes
    removeSongFromPlaylist = () => {}
}