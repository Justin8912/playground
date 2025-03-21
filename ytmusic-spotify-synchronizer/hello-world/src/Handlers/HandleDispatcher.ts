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
    const handler = getHandler(route, method, appConfig);
    return await handler(event);
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("Here is the event", {data: event});
    let user = "justin"; // TODO: We need to get the name of the user from whatever request is made somehow.
    let appConfig = new AppConfig(new EnvironmentConfig(user));
    await appConfig.initialize();
    try {
        return await router(event, appConfig);
    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};