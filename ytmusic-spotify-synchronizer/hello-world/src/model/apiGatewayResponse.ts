export const getAPIGatewayResponse = (statusCode: number, body: string, opt:object={}) => {
    return {
        statusCode,
        body,
        isBase64Encoded: false,
        ...opt
    }
}