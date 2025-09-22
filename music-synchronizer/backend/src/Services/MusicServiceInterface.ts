import {
    GetPlaylistsResponse,
    Song
} from "../Model/MusicService.js";

export interface MusicServiceInterface {
    getPlaylists(): Promise<GetPlaylistsResponse[]>
    createPlaylist(name: string, description?: string): Promise<string>
    addSongsToPlaylist(playlistName: string, songs: Song[]): Promise<Song[]>
    getPlaylistByName(name: string): Promise<GetPlaylistsResponse | null>
    getSong(song: Song): Promise<Song | null>
}