import {describe, it, expect} from 'vitest';
import {getSongIdFromUrl} from "../../src/Services/Synchronization";

describe('getSongIdFromUrl', () => {
    it("Should return the track id from a spotify song", () => {
        const trackId = getSongIdFromUrl("https://open.spotify.com/track/7mf6EqBXVrFZrV5sheEo35", 'spotify');
        expect(trackId).toBe("7mf6EqBXVrFZrV5sheEo35")
    })

    it("Should return the track id from a spotify song: Ignore path params", () => {
        const trackId = getSongIdFromUrl("https://open.spotify.com/track/7mf6EqBXVrFZrV5sheEo35?si=asdfasdfasdf", 'spotify');
        expect(trackId).toBe("7mf6EqBXVrFZrV5sheEo35")
    });

    it('should handle youtube music urls', () => {
        const trackId = getSongIdFromUrl("https://music.youtube.com/watch?v=dEyPelEU4IE&si=EEze6UmbdLhnsU7d", 'youtube');
        expect(trackId).toBe("dEyPelEU4IE")
    })

    it('Should handle youtube urls', () => {
        const trackId = getSongIdFromUrl("https://www.youtube.com/watch?v=rNv8K8AYGi8", 'youtube');
        expect(trackId).toBe("rNv8K8AYGi8")
    })
});
