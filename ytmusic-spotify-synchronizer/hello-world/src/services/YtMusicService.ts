export class YtMusicService {
    private accessToken: string;
    private refreshToken: string;

    constructor(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    getPlaylists = () => {
        // Get all playlists from YouTube Music

    }
    getSongs = (playlist) => {}

    // For communicating between different applications
    formatMetadata = (song) => {}

    searchForSong = () => {}

    createPlaylist = () => {}
    addSongToPlaylist = () => {}

    // This should be a later implementation, first pass should only be additive changes
    removeSongFromPlaylist = () => {}
}