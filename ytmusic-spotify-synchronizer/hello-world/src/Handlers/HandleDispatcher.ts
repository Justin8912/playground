import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import logger from "../util/logger.js";
import {getHandler} from "./Router.js";
import {AppConfig} from "../config/AppConfig.js";
import {EnvironmentConfig} from "../config/EnvironmentConfig.js";

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
const getRouteAndMethod = (event: APIGatewayProxyEvent): {route:string, method:string} => {
    return {
        route: event.requestContext.path,
        method: event.requestContext.httpMethod
    }
}

let appConfig;

const router = async (event: APIGatewayProxyEvent, appConfig: AppConfig) => {
    const {route, method} = getRouteAndMethod(event);
    console.log(route, method)
    const handler = getHandler(route, method, appConfig);
    console.log("Handler: ", handler)
    await handler(event);

}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("Here is the event", {data: event});
    logger.info("Here is the important info: ", {data: getRouteAndMethod(event)});
    let user = "justin"; // TODO: We need to get the name of the user from whatever request is made somehow.
    let appConfig = new AppConfig(new EnvironmentConfig(user));
    try {
        await router(event, appConfig);
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