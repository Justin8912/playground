import {Request} from "express";

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
            console.error("Cannot retrieve object from memory without key and requestId");
            return null;
        }

        const memoryObject = this.memory[key][requestId];

        if (!memoryObject) {
            console.log("Could not find object in memory with provided key and requestId");
            return null;
        }

        const memoryObjectRequestDetails = memoryObject.requestDetails || {};
        const requestInputParameters = {
            ...req.headers,
            ...req.query,
            ...req.params
        }

        for (const key of Object.keys(memoryObjectRequestDetails)) {
            if (requestInputParameters[key]?.toLowerCase() !== memoryObjectRequestDetails[key].toLowerCase()) {
                console.error(`requestInputParameter ${key} with value ${requestInputParameters[key]} does not match the stored requestDetails value of ${memoryObjectRequestDetails[key]}`);
                return null;
            }
        }

        return memoryObject;
    }
}