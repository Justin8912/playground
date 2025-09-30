import crypto from "crypto";

export const getGoogleAuthorizationUri = (scopes: string[], googleOAuthClient: any) => {
    const state = crypto.randomBytes(32).toString('hex');
    const authorizationUrl = googleOAuthClient.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        include_granted_scopes: true,
        state
    });

    return {
        authorizationUrl,
        state
    }
}

export const getSpotifyAuthorizationUri = (
    scopes: string[],
    clientId: string,
    redirectUri: string
) => {
    const baseUrl = "https://accounts.spotify.com/authorize";
    const state = crypto.randomBytes(32).toString('hex');
    const queryParams = [
        ["response_type", "code"],
        ["scopes", scopes.join(",")],
        ["client_id", clientId],
        ["redirect_uri", redirectUri],
        ["state", state]
    ]
    const searchParams = new URLSearchParams(queryParams);
    return {
        authorizationUrl: baseUrl + "?" + searchParams.toString(),
        state
    }
}