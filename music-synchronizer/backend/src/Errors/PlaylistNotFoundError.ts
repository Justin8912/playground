export class PlaylistNotFoundError extends Error {
    constructor(message: string, options?: { cause?: unknown }) {
        super(message, options);
        this.name = "PlaylistNotFoundError";
    }
}