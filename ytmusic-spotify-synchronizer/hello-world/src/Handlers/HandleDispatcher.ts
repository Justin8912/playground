import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import logger from "../util/logger.js";
import {HCPVaultService} from "../services/VaultService.js";
import {getHandler} from "./Router.js";
/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
const getRouteAndMethod = (event: APIGatewayProxyEvent) => {
    return {
        route: event.requestContext.path,
        method: event.requestContext.httpMethod
    }
}

const router = async (event: APIGatewayProxyEvent) => {
    const {route, method} = getRouteAndMethod(event);
    const handler = getHandler(route, method);
    console.log(handler);
    await handler(event);
}
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("Here is the event", {data: event});
    logger.info("Here is the important info: ", {data: getRouteAndMethod(event)});
    await router(event);
    try {
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'hello world',
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};