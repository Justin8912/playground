import {type Context, util} from "@aws-appsync/utils";

export function request(ctx: Context) {
    return {
        operation: 'Scan',
        filter: JSON.parse(util.transform.toDynamoDBFilterExpression({ SortKey: { eq: "Game"  } })),
    }
}

export function response(ctx: Context) {
    if (!ctx.result) {
        console.log("error: ", ctx.error);
    }
    return ctx.result.items;
}