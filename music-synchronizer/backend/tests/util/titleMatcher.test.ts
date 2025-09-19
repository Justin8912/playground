import { isSongMatch } from '../../src/Util/titleMatcher';
import {describe, it, expect} from 'vitest';

describe('isSongMatch', () => {
    it('returns true for obvious matches with minor differences', () => {
        expect(
            isSongMatch(
                { title: 'Tame Impala - Feels Like We Only Go Backwards (Official Video)', artist: 'tameimpalaVEVO' },
                { title: 'Feels Like We Only Go Backwards', artist: 'Tame Impala' }
            )
        ).toBe(true);
    });

    it('returns false for completely unrelated songs', () => {
        expect(
            isSongMatch(
                { title: 'DOUBLE KING', artist: 'Felix Colgrave' },
                { title: 'Monster', artist: 'Kanye West, JAY-Z, Rick Ross, Nicki Minaj, Bon Iver' }
            )
        ).toBe(false);
    });

    it('returns true for case-insensitive and punctuation differences', () => {
        expect(
            isSongMatch(
                { title: 'hello world!', artist: 'Foo' },
                { title: 'Hello World', artist: 'Foo' }
            )
        ).toBe(true);
    });

    it('returns true - this is a false positive but something like this is expected', () => {
        expect(
            isSongMatch(
                { title: 'Feels Like We Only Go Backwards', artist: 'Tame Impala' },
                { title: 'Feels Like We Only Go Backwards', artist: 'Kanye West' }
            )
        ).toBe(true);
    });

    it('should return true for actual matches - 1', () => {
        expect(
            isSongMatch(
                {title: "fred again... & baby keem - leavemealone (nia archives remix)", artist: 'UKF Drum & Bass'},
                {title: "leavemealone", artist: 'Fred again.. Baby Keem'}
            )
        ).toBe(true)
    });

    it('should return true for actual matches - 2', () => {
        expect(
            isSongMatch(
                {title: "pendulum, joey valence & brae - napalm (visualiser)", artist: 'PendulumVEVO'},
                {title: "Napalm", artist: 'Pendulum Joey Valence & Brae'}
            )
        ).toBe(true)
    })
});
