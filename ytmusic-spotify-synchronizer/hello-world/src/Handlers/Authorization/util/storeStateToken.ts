import crypto from "crypto";
import logger from "../../../util/logger.js";

export const storeStateToken = async (
    getUser: () => string,
    setParameter: (input: string, data:any) => Promise<void>): Promise<string> => {
    const state = crypto.randomBytes(32).toString('hex');

    try {
        logger.debug("Setting parameter: ", {name: `temp-auth/${state}`})
        await setParameter(`temp-auth/${state}`, {
            user: getUser(),
            timestamp: Date.now()
        });
    } catch(err) {
        throw new Error("Failed to write document to vault in google authorization uri.", {cause: err});
    }

    return state;
}

export const getStoredStateToken = async (
    stateToken: string,
    getParameter: (input: string) => Promise<Record<string, string>>
): Promise<Record<string, string>> => {
    logger.debug("Getting the parameter: ", {name: `temp-auth/${stateToken}`})
    return await getParameter(`temp-auth/${stateToken}`);
}

export const removeStoredStateToken = async (
    stateToken: string,
    removeParameter: (input: string) => Promise<void>
): Promise<void> => {
    logger.debug("Removing the parameter: ", {name: `temp-auth/${stateToken}`})
    await removeParameter(`temp-auth/${stateToken}`);
}