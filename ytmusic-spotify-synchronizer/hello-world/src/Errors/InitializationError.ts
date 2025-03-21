export class IntializationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "IntializationError";
    }
}