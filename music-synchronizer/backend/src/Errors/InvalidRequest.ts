export class InvalidRequest extends Error {
    constructor(message: string, options?:ErrorOptions) {
        super(message, options);
        this.name = "InvalidRequest";
        this.cause = options?.cause;
    }
}