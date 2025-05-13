import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import logger from "../util/logger.js";
import {getHandler} from "./Router.js";
import {AppConfig} from "../config/AppConfig.js";
import {EnvironmentConfig} from "../config/EnvironmentConfig.js";
import {configMapper} from "../util/configMapper.js";

// TODO: Figure out how to handle source and sink user configurations and how to pass those to methods.
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

const router = async (event: APIGatewayProxyEvent, appConfig: AppConfig) => {
    const {route, method} = getRouteAndMethod(event);
    const handler = getHandler(route, method, appConfig);
    return await handler(event);
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let user = "justin"; // TODO: We need to get the name of the user from whatever request is made somehow.
    let justinConfig = new AppConfig(new EnvironmentConfig(user));
    configMapper["justin"] = justinConfig;

    // I think I need to think more broadly about the appConfig. The appConfig should not be specific to a user.
    //   Instead, maybe the appConfig should hold references to more specific user configurations.
    await justinConfig.initialize();
    try {
        return await router(event, justinConfig);
    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: err,
            }),
        };
    }
};