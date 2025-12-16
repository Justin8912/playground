import { doSongsMatch } from '../../src/Util/titleMatcher';
import {describe, it, expect} from 'vitest';
import {Song} from "../../src/Model/MusicService";

describe('isSongMatch', () => {
    it('returns true for obvious matches with minor differences', () => {
        let song1 = { title: 'Tame Impala - Feels Like We Only Go Backwards (Official Video)', artist: 'tameimpalaVEVO' } as Song;
        let song2 = { title: 'Feels Like We Only Go Backwards', artist: 'Tame Impala' } as Song;
        expect(doSongsMatch(song1, song2)).toBe(true);
    });

    it('returns false for completely unrelated songs', () => {
        let song1 = { title: 'DOUBLE KING', artist: 'Felix Colgrave' } as Song;
        let song2 = { title: 'Monster', artist: 'Kanye West, JAY-Z, Rick Ross, Nicki Minaj, Bon Iver' } as Song;
        expect(doSongsMatch(song1, song2)).toBe(false);
    });

    it('returns true for case-insensitive and punctuation differences', () => {
        let song1 = { title: 'hello world!', artist: 'Foo' } as Song;
        let song2 = { title: 'Hello World', artist: 'Foo' } as Song;
        expect(doSongsMatch(song1, song2)).toBe(true);
    });

    it('returns true - this is a false positive but something like this is expected', () => {
        let song1 = { title: 'Feels Like We Only Go Backwards', artist: 'Tame Impala' } as Song;
        let song2 = { title: 'Feels Like We Only Go Backwards', artist: 'Kanye West' } as Song;
        expect(doSongsMatch(song1, song2)).toBe(true);
    });

    it('should return true for actual matches - 1', () => {
        let song1 = {title: "fred again... & baby keem - leavemealone (nia archives remix)", artist: 'UKF Drum & Bass'} as Song;
        let song2 = {title: "leavemealone", artist: 'Fred again.. Baby Keem'} as Song;
        expect(doSongsMatch(song1, song2)).toBe(true)
    });

    it('should return true for actual matches - 2', () => {
        let song1 = {title: "pendulum, joey valence & brae - napalm (visualiser)", artist: 'PendulumVEVO'} as Song;
        let song2 = {title: "Napalm", artist: 'Pendulum Joey Valence & Brae'} as Song;
        expect(doSongsMatch(song1, song2)).toBe(true)
    })
});
