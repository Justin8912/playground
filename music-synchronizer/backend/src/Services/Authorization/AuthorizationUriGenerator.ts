import crypto from "crypto";

export const getGoogleAuthorizationUri = (googleOAuthClient: any) => {
    const state = crypto.randomBytes(32).toString('hex');
    const authorizationUrl = googleOAuthClient.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/youtube.readonly",
            "https://www.googleapis.com/auth/youtube.upload",
            "https://www.googleapis.com/auth/youtube.force-ssl"
        ],
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