export interface Song {
    title: string;
    artists: string[];
    description?: string;
    videoId?: string;
}

export interface PlaylistImage {
    url: string;
}

export interface GetPlaylistIdsResponse {
    id: string;
    title: string;
    description?: string;
    image?: PlaylistImage;
}

export interface GetPlaylistsResponse {
    id: string;
    title: string;
    description?: string;
    image?: PlaylistImage;
    songs: Song[];
}