export class MemoryObjectRetrievalError extends Error {
    constructor(message?: string) {
        if (!message) {
            message = "Could not find the request object in memory. Please check the request parameters and try again.";
        }
        super(message);
        this.name = "MemoryObjectRetrievalError";
    }
}