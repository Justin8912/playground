export class InitializationError extends Error {
    constructor(message: string, options?:ErrorOptions) {
        super(message, options);
        this.name = "InitializationError";
        this.cause = options?.cause;
    }
}