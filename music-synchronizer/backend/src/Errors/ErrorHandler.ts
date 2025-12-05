import {Response, Request} from 'express';

const serializeError = (error: any): any => {
    if (!error) return null;
    const { name, message, stack, cause, ...rest } = error;
    return {
        name,
        message,
        // stack,
        // ...rest,
        cause: cause ? serializeError(cause) : undefined
    };
};

export const handleError = (error: any, res: Response) => {
    const getErrorType = (error: any): string => {
        return error?.name;
    };

    switch (getErrorType(error)) {
        case 'MemoryObjectUpdateError':
        case 'PlaylistSynchronizationError':
        case 'PlaylistRetrievalError':
        case 'HCPVaultError':
        case 'SongRetrievalError':
        case 'InvalidRequest':
            res.status(400).json(serializeError(error));
            return;

        case 'PlaylistNotFoundError':
        case 'MemoryObjectRetrievalError':
            res.status(404).json(serializeError(error));
            return;

        default:
            res.status(500).json({
                error: "An unexpected error occurred.",
                details: error instanceof Error ? error.message : String(error)
            });
    }
}