export class PlaylistNotFoundError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "PlaylistNotFoundError";
        this.cause = options?.cause;
    }
}