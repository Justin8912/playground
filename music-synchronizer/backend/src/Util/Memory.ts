import {Request} from "express";
import {MemoryObjectRetrievalError} from "../Errors/MemoryObjectRetrievalError.js";

export class Memory {
    private memory: { [key: string]: { [requestId: string]: any } } = {};

    constructor(...args: string[]) {
        for (let i = 0; i < args.length; i += 2) {
            this.memory[args[i]] = {};
        }
    }

    createMemoryObject = (key: string, requestDetails: any, memoryObject: any): string => {
        let requestId = crypto.randomUUID()
        this.memory[key][requestId] = memoryObject;
        this.memory[key][requestId].requestDetails = requestDetails;
        return requestId;
    }

    getObjectFromMemory = (key: string, requestId: string, req: Request): any => {
        if (key.trim() === "" || requestId.trim() === "") {
            throw new MemoryObjectRetrievalError("Cannot retrieve object from memory without key and requestId")
        }

        const memoryObject = this.memory[key][requestId];

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

    public injectMemoryObject(key: string, requestId: string, memoryObject: any) {{}
        this.memory[key][requestId] = memoryObject;
    }
}