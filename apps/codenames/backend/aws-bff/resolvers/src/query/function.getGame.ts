import {type Context, util} from "@aws-appsync/utils";

export function request(ctx: Context) {
    const id = ctx.arguments.gameId;
    return {
        operation: 'Query',
        query: {
            expression: "PartitionKey = :gameId",
            expressionValues: util.dynamodb.toMapValues({ ":gameId": `${id}`})
        },
    }
}

export function response(ctx: Context) {
    if (!ctx.result) {
        console.log("error: ", ctx.error);
    }
    return ctx.result.items[0];
}