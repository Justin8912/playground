import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {GetPlaylists} from "./GetPlaylists.js";
import {GetPlaylistContent} from "./GetPlaylistContent.js";
import {DifferenceBetweenDiscographies} from "./DifferenceBetweenDiscographies.js";
import {GetAuthorizationUriGoogle} from "./Authorization/Google/GetAuthorizationUri.js";
import {GetAuthorizationUriSpotify} from "./Authorization/Spotify/GetAuthorizationUri.js";
import {AppConfig} from "../config/AppConfig.js";
import {RedirectHandler} from "./Authorization/Google/RedirectHandler.js";

export const getHandler = (path: string, method: string, appConfig: AppConfig): ((event: APIGatewayProxyEvent, opt?:any)=>Promise<APIGatewayProxyResult>) => {
    const router = {
        "GET /hello": ((event:APIGatewayProxyEvent) => {}), // This is a dummy route
        "GET /playlist": ((event:APIGatewayProxyEvent) => GetPlaylists(appConfig)(event)),
        "GET /playlist/content": ((event:APIGatewayProxyEvent)=>(GetPlaylistContent(appConfig)(event))),
        "GET /playlist/synchronize": ((event:APIGatewayProxyEvent)=>DifferenceBetweenDiscographies(appConfig, false)(event)),
        "POST /playlist/synchronize": ((event:APIGatewayProxyEvent)=>DifferenceBetweenDiscographies(appConfig, true)(event)),
        "GET /authorization/google/authorization-uri": ((event:APIGatewayProxyEvent)=>GetAuthorizationUriGoogle(appConfig)(event)),
        "GET /authorization/google/redirect-uri": ((event:APIGatewayProxyEvent)=>RedirectHandler(appConfig)(event)),
        "GET /authorization/spotify/authorization-uri": ((event:APIGatewayProxyEvent)=>GetAuthorizationUriSpotify(appConfig)(event))
    }

    // @ts-ignore
    return router[`${method} ${path}`];
}