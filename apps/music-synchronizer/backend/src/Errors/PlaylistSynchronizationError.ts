export class PlaylistSynchronizationError extends Error {
    constructor(message?: string) {
        if (!message) {
            // TODO: If we ever implement this controller so that we dont need this header, we will need to update this
            //   error message.
            message = "The playlist synchronization did not complete successfully. Please ensure that the proposedChangeId is being sent with the request.";
        }
        super(message);
        this.name = "PlaylistSynchronizationError";
    }
}