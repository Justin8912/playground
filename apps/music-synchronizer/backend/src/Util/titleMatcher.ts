import {pipe} from "./pipe.js";
import {Song} from "../Model/MusicService.js";
import logger from "./logger.js";

export const normalizeSongTitle = (title:string): string => {
    let removeAfterPipe = (title: string) => title.split('|')[0].trim();
    const removeOfficialVideoVariants = (title: string): string =>
        title
            .replace(
                /-?\s*[\(\[\{]?\s*official\s*(animated\s*)?(music\s*)?video\s*[\)\]\}]?/gi,
                ""
            )
            .trim();
    const filterSongTitle = pipe(
        removeAfterPipe,
        removeOfficialVideoVariants
    )

    return filterSongTitle(title.toLowerCase());
}

export const removeParenthesisContent = (title: string): string => {
    return title.replace(/ *\([^)]*\) */g, ' ').replace(/ +/g, ' ').trim();
}

const similarity = (a: string, b: string): number => {
    const setA = new Set(a.split(' '));
    const setB = new Set(b.split(' '));

    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    return union.size === 0 ? 0 : intersection.size / union.size;
};

export const doSongsMatch = (source: Song, target: Song): boolean => {
    logger.info(`Song comparison: \n\tsource: ${source.title} by ${source.artists}\n\ttarget: ${target.title} by ${target.artists}`);
    const sourceTitle = normalizeSongTitle(source.title);
    const targetTitle = normalizeSongTitle(target.title);
    const sourceArtist = source.artists.join(" ").toLowerCase();
    const targetArtist = target.artists.join(" ").toLowerCase();

    // Require high similarity for both title and artist
    const titleScore = similarity(sourceTitle, targetTitle);
    const artistScore = similarity(sourceArtist, targetArtist);

    const strictSongArtistDistinction = titleScore > 0.7 && artistScore > 0.7;

    if (!strictSongArtistDistinction) {
        const combinedScore = similarity(`${sourceTitle} ${sourceArtist}`, `${targetTitle} ${targetArtist}`);
        if (combinedScore > 0.2) return true
        // Try without parenthesis content
        const combinedScoreWithoutParenthesis = similarity(`${removeParenthesisContent(sourceTitle)} ${sourceArtist}`, `${removeParenthesisContent(targetTitle)} ${targetArtist}`);
        return combinedScoreWithoutParenthesis > 0.2
    } else return true;
};
