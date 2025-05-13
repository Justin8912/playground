import {GetPlaylistsResponse, Song} from "../../../model/MusicTypes.js";
import {formatSearchQuery} from "./formatSearchQuery.js";
import logger from "../../../util/logger.js";

export async function transferMusic(
    source: GetPlaylistsResponse,
    sink: GetPlaylistsResponse,
    getSongIdSink: (song: Song) => Promise<string | undefined>,
    addSongsToPlaylistSink: (playlistId: string, uris: string[]) => Promise<void>,
): Promise<void> {
    logger.info("sourceSongs: " + JSON.stringify(source.songs));
    logger.info("sinkSongs: " + JSON.stringify(sink.songs));
    let songDifference = findDifferencesBetweenPlaylists(source.songs, sink.songs);
    logger.info("Difference between playlists: " + JSON.stringify(songDifference));
    let songUrisPromises: Promise<string | undefined>[] = songDifference.map((song: Song) => {
        return getSongIdSink(song);
    })
    let songIds = await Promise.all(songUrisPromises);
    songIds = songIds.filter((id, idx) => {
        if (!id) {
            console.log(`${songDifference[idx].title} by ${songDifference[idx].artists.join(", ")} could not be found in the sink service. Please add manually.`)
            return false;
        }
        return true;
    })
    logger.info("SongIds: " + songIds);
    await addSongsToPlaylistSink(sink.id, songIds);
    logger.info("Songs added to playlist");
}

function findDifferencesBetweenPlaylists(
    source: Song[],
    sink: Song[]
): Song[] {
    const sinkSet = new Set(
        sink.map(song => ({
            title: song.title.toLowerCase(),
            artists: new Set(song.artists.map(artist => artist.toLowerCase()))
        }))
    );

    return source.filter(sourceSong => {
        const sourceTitle = sourceSong.title.toLowerCase();
        const sourceArtists = new Set(sourceSong.artists.map(artist => artist.toLowerCase()));

        for (const sinkSong of sinkSet) {
            const sinkTitle = sinkSong.title;
            const sinkArtists = sinkSong.artists;

            // Check if the source title is a subset of the sink title or vice versa
            const titleMatch =
                sourceTitle.includes(sinkTitle) || sinkTitle.includes(sourceTitle);

            // Check if there is at least one overlapping artist
            const artistMatch = [...sourceArtists].some(artist => sinkArtists.has(artist));

            if (titleMatch && artistMatch) {
                return false; // Song exists in the sink
            }
        }

        return true; // Song does not exist in the sink
    });
}