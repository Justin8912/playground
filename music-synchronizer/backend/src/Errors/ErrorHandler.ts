import {Response} from 'express';
import {InvalidRequest} from "./InvalidRequest.js";
import {MemoryObjectUpdateError} from "./MemoryObjectUpdateError.js";
import {PlaylistSynchronizationError} from "./PlaylistSynchronizationError.js";

export const handleError = (error: any, res: Response) => {
    if (error instanceof MemoryObjectUpdateError || PlaylistSynchronizationError) {
        res.status(400).json({
            message: error.message
        });
    }

    if (error instanceof InvalidRequest) {
        res.status(400).json({
            message: `The request is missing required input parameters: ${error.message}`
        });
    }

    res.status(500).json({
        error: "An unexpected error occurred.",
        details: error instanceof Error ? error.message : String(error)
    });
}