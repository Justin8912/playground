export type GetPlaylistIdsResponse = {
    id: string
    title: string
    description: string,
    images: {url: string}[]
}

export type Song = {
    title: string
    artists: string[]
    description?: string
}

export type GetPlaylistsResponse = GetPlaylistIdsResponse & {
    songs: Song[]
}

