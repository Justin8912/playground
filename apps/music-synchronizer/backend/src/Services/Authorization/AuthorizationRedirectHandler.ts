import {AccessToken} from "@spotify/web-api-ts-sdk";

export const handleGoogleAuthorizationRedirect = async (
    user: string,
    googleOAuthClient: any,
    authCode: string,
    setParameter: (
        storageKey: string,
        {refresh_token, access_token}: {refresh_token:string, access_token: string}
    ) => Promise<void>
): Promise<void> => {
    const googleResult = await googleOAuthClient.getToken(authCode);
    await setParameter(`google/${user}`, {
        refresh_token: googleResult.tokens.refresh_token,
        access_token: googleResult.tokens.access_token
    });
}

export const handleSpotifyAuthorizationRedirect = async (
    user: string,
    authCode: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    setUserSpotifyCredentials: (user: string, accessToken: AccessToken) => Promise<void>
): Promise<void> => {
    const authToken = "Basic " + Buffer.from(
        `${clientId}:${clientSecret}`
    ).toString("base64");

    let authOptions = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': authToken
        },
        body: new URLSearchParams({
            code: authCode,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        }),
        method: "POST"
    };

    let result  = await fetch('https://accounts.spotify.com/api/token', authOptions);
    const {
        access_token,
        refresh_token,
        token_type,
        expires_in
    } = await result.json() as { access_token: string, refresh_token: string, token_type: string, expires_in: string };

    await setUserSpotifyCredentials(user, {
        access_token: access_token,
        refresh_token: refresh_token,
        token_type: token_type,
        expires_in: parseInt(expires_in)
    });
}