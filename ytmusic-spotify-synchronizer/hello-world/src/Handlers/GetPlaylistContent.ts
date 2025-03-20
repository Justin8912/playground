import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";

export const GetPlaylistContent = async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("GetPlaylistContent")
    return {} as APIGatewayProxyResult;
}