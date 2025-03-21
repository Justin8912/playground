export class SpotifyService{
    private clientId: string;
    private clientSecret: string;

    constructor(clientId: string, clientSecret: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    retrievePlaylists = () => {}
    retrieveSongs = (playlist) => {}

    // For communicating between different applications
    formatMetadata = (song) => {}

    searchForSong = () => {}

    createPlaylist = () => {}
    addSongToPlaylist = () => {}

    // This should be a later implementation, first pass should only be additive changes
    removeSongFromPlaylist = () => {}
}