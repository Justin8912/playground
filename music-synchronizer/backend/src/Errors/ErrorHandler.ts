import {Response} from 'express';

export const handleError = (error: any, res: Response) => {
    const getErrorType = (error: any): string => {
        return error?.name;
    };

    switch (getErrorType(error)) {
        case 'MemoryObjectUpdateError':
        case 'PlaylistSynchronizationError':
        case 'PlaylistRetrievalError':
        case 'HCPVaultError':
            res.status(400).json({
                message: error.message,
                cause: error.cause
            });
            return;

        case 'InvalidRequest':
            res.status(400).json({
                message: `The request is missing required input parameters: ${error.message}`,
                cause: error.cause
            });
            return;

        case 'PlaylistNotFoundError':
            res.status(404).json({
                message: error.message,
                cause: error.cause
            });
            return;

        default:
            res.status(500).json({
                error: "An unexpected error occurred.",
                details: error instanceof Error ? error.message : String(error)
            });
    }
}