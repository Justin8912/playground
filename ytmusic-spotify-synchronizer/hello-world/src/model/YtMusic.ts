export type GetPlaylistIdsResponse = {
    id: string
    title: string
    description: string
}

export type Song = {
    title: string
    description: string
}

export type GetPlaylistsResponse = GetPlaylistIdsResponse & {
    songs: Song[]
}

