export class MemoryObjectUpdateError extends Error {
    constructor(message?: string) {
        if (!message) {
            message = "The memory object update did not complete successfully. Please verify that the request parameters are correct and try again.";
        }
        super(message);
        this.name = "MemoryObjectUpdateError";
    }
}