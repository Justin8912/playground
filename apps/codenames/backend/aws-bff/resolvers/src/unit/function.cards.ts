import {type Context, util} from "@aws-appsync/utils";

export function request(ctx: Context) {
    const gameId = ctx.source.PartitionKey;
    return {
        operation: "Query",
        query: {
            expression: "GameId = :gameId AND begins_with(SortKey, :sk)",
            expressionValues: util.dynamodb.toMapValues({ ":gameId": `${gameId}`, ":sk": "Card"})
        },
        index: "SelectByGameId"
    }
}

export function response(ctx: Context) {
    if (!ctx.result) {
        console.log("Here: ", ctx.error);
    }
    return ctx.result.items;
}