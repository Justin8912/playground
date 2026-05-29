import {type Context, util} from "@aws-appsync/utils";

export function request(ctx: Context) {
    const {cardId, lastSelectedBy} = ctx.arguments.cardInput;
    return {
        operation: 'UpdateItem',
        key: util.dynamodb.toMapValues({PartitionKey: cardId, SortKey: "Card"}),
        update: {
            expression: "SET LastSelectedBy = :lastSelectedBy",
            expressionValues: util.dynamodb.toMapValues({
                ":lastSelectedBy": lastSelectedBy,
            }),
        },
    }
}

export function response (ctx: Context) {
    if (!ctx.result) {
        console.log("here: ", ctx);
        return false;
    }
    return ctx.result;
}