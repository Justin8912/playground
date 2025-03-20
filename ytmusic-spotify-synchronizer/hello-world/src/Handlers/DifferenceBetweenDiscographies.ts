import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {AppConfig} from "../config/AppConfig.js";

export const DifferenceBetweenDiscographies = (appConfig: AppConfig, shouldApply: boolean): (event: APIGatewayProxyEvent)=>Promise<APIGatewayProxyResult> => {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        return {} as any as APIGatewayProxyResult;
    }
}