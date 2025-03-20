import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {GetPlaylists} from "./GetPlaylists.js";
import {GetPlaylistContent} from "./GetPlaylistContent.js";
import {DifferenceBetweenDiscographies} from "./DifferenceBetweenDiscographies.js";
import {GetAuthorizationUriGoogle} from "./Authorization/GetAuthorizationUriGoogle.js";
import {GetAuthorizationUriSpotify} from "./Authorization/GetAuthorizationUriSpotify.js";

export const getHandler = (path: string, method: string): (event: APIGatewayProxyEvent, opt?:any)=>Promise<APIGatewayProxyResult> => {
    const router = {
        "GET /playlist": GetPlaylists,
        "GET /playlist/content": GetPlaylistContent,
        "GET /playlist/synchronize": DifferenceBetweenDiscographies(false),
        "POST /playlist/synchronize": DifferenceBetweenDiscographies(true),
        "GET /authorization/google/authorization-uri": GetAuthorizationUriGoogle,
        "GET /authorization/spotify/authorization-uri": GetAuthorizationUriSpotify
    }
    // @ts-ignore
    return router[`${method} ${path}`];
}