import {Song} from "../../../model/YtMusic.js";

export function formatSearchQuery(song: Song): string {
    return `${cleanTitle(song.title)} - ${song.artists.join(", ")}`
}

function cleanTitle(title: string): string {
    title = title.toLowerCase();

    // Remove music video tag from the title
    const removeMusicVideoTagRegex = /\s*\(official music video|official video|music video\)\s*/i;
    title = title.replace(removeMusicVideoTagRegex, '');

    return title;
}