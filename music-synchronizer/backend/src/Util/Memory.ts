import {Request} from "express";
import {MemoryObjectRetrievalError} from "../Errors/MemoryObjectRetrievalError.js";

export const PROPOSED_CHANGES_HEADER = "proposed-changes-id";
export const PROPOSED_CHANGES_MEMORY_KEY = "PROPOSED_CHANGES";
export const AUTH_STATE_MEMORY_KEY = "AUTH_STATE";

export class Memory {
    private memory: { [key: string]: { [requestId: string]: any } } = {};

    constructor() {
        this.memory[PROPOSED_CHANGES_MEMORY_KEY] = {};
        this.memory[AUTH_STATE_MEMORY_KEY] = {};
    }

    initializeMemoryObject = (...args: string[]): void => {
        for (let i = 0; i < args.length; i += 2) {
            this.memory[args[i]] = {};
        }
    }

    createMemoryObject = (classificationKey: string, key: string, requestDetails: any, memoryObject: any): string => {
        this.memory[classificationKey][key] = memoryObject;
        this.memory[classificationKey][key].requestDetails = requestDetails;
        return key;
    }

    deleteMemoryObject = (classificationKey: string, key: string): void => {
        delete this.memory[classificationKey][key];
    }

    // TODO: Refactor this, dont like that there is request validation logic in here.
    safeGetObjectFromMemory = (classificationKey: string, requestId: string, req: Request): any => {
        if (classificationKey.trim() === "" || requestId.trim() === "") {
            throw new MemoryObjectRetrievalError("Cannot retrieve object from memory without key and requestId")
        }

        const memoryObject = this.memory[classificationKey][requestId];

        if (!memoryObject) {
            throw new MemoryObjectRetrievalError("Could not find object in memory with provided key and requestId");
        }

        const memoryObjectRequestDetails = memoryObject.requestDetails || {};
        const requestInputParameters = {
            ...req.headers,
            ...req.query,
            ...req.params
        }

        for (const key of Object.keys(memoryObjectRequestDetails)) {
            if (requestInputParameters[key]?.toLowerCase() !== memoryObjectRequestDetails[key].toLowerCase()) {
                throw new MemoryObjectRetrievalError(`requestInputParameter ${key} with value ${requestInputParameters[key]} does not match the stored requestDetails value of ${memoryObjectRequestDetails[key]}`);
            }
        }

        return memoryObject;
    }

    getObjectFromMemory = (classificationKey: string, key: string) => {
        const memoryObject = this.memory[classificationKey][key];
        if (!memoryObject) {
            throw new MemoryObjectRetrievalError(`Could not find object in memory with provided key: ${key} and classificationKey: ${classificationKey}`);
        }
        return memoryObject;
    }

    public injectMemoryObject(key: string, requestId: string, memoryObject: any) {{}
        this.memory[key][requestId] = memoryObject;
    }
}