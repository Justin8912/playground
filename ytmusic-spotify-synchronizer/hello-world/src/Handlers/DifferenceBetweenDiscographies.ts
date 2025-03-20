import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";

export const DifferenceBetweenDiscographies = (shouldApply: boolean): (event: APIGatewayProxyResult)=>Promise<APIGatewayProxyResult> => {
    return (event: APIGatewayProxyResult): Promise<APIGatewayProxyResult> => {
        return {} as any as APIGatewayProxyResult;
    }
}