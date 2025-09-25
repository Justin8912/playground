import {
    GetPlaylistsResponse,
    Song
} from "../Model/MusicService.js";

export interface MusicServiceInterface {
    getPlaylists(): Promise<GetPlaylistsResponse[]>
    addSongsToPlaylist(playlistName: string, songs: Song[]): Promise<Song[]>
    addUserApprovedSongsToPlaylist(playlistName: string, songs: Song[]): Promise<Song[]>
    getPlaylistByName(name: string): Promise<GetPlaylistsResponse>
    getSong(song: Song): Promise<Song | null>
    getSongById(songId: string): Promise<Song | null>
}