export class AddSongError extends Error {
    constructor(message: string, options?:ErrorOptions) {
        super(message, options);
        this.name = "SongAddError";
    }
}