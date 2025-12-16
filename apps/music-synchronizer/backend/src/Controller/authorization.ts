import {Request, Response} from "express";
import {extractParamsFromReq} from "./controllerHelpers.js";
import {
    getGoogleAuthorizationUri,
    getSpotifyAuthorizationUri
} from "../Services/Authorization/AuthorizationUriGenerator.js";
import {appConfig, hcpVaultService, memory} from "../handler.js";
import {AUTH_STATE_MEMORY_KEY} from "../Util/Memory.js";
import {
    handleGoogleAuthorizationRedirect,
    handleSpotifyAuthorizationRedirect
} from "../Services/Authorization/AuthorizationRedirectHandler.js";
import {handleError} from "../Errors/ErrorHandler.js";

export const getAuthorizationUriController = async (req: Request, res: Response) => {
    const { user, service } = extractParamsFromReq(["user", "service"], req.params);
    if (service === "youtube") {
        const {authorizationUrl, state} = getGoogleAuthorizationUri(
            appConfig.getEnvironmentConfig().getGoogleScopes(),
            appConfig.getGoogleOauth2Client()
        );

        memory.createMemoryObject(AUTH_STATE_MEMORY_KEY, state, req.params, {user});
        res.json({authorizationUrl});
    } else if (service === "spotify") {
        const {
            client_id,
            redirect_uri
        } = appConfig.getSpotifyServerCredentials();

        const {authorizationUrl, state} = getSpotifyAuthorizationUri(
            appConfig.getEnvironmentConfig().getSpotifyScopes(),
            client_id,
            redirect_uri
        );

        memory.createMemoryObject(AUTH_STATE_MEMORY_KEY, state, req.params, {user});
        res.json({authorizationUrl});
    }
}

export const handleRedirectController = async (req: Request, res: Response) => {
    const { service } = extractParamsFromReq(["service"], req.params);
    const { state, code } = extractParamsFromReq(["state", "code"], req.query, false);

    // This is the check of the state. If the user tries to use a different state, then this method will throw an error.
    const memoryObject = memory.getObjectFromMemory(AUTH_STATE_MEMORY_KEY, state);
    const {user} = memoryObject;
    memory.deleteMemoryObject(AUTH_STATE_MEMORY_KEY, state);

    if (service === "youtube") {
        await handleGoogleAuthorizationRedirect(
            user,
            appConfig.getGoogleOauth2Client(),
            code,
            appConfig.getHcpVaultService().setParameter
        );
    } else if (service === "spotify") {
        const { client_id, client_secret, redirect_uri } = appConfig.getSpotifyServerCredentials();

        await handleSpotifyAuthorizationRedirect(
            user,
            code,
            client_id,
            client_secret,
            redirect_uri,
            hcpVaultService.setUserSpotifyCredentials
        )
    }

    res.status(202).json({status: "success"});
}