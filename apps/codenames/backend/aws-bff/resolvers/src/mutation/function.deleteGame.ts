import {Context} from "@aws-appsync/utils";

export function request(ctx: Context) {
    const gameId = ctx.arguments.gameId;
    return {
        operation: "Invoke",
        payload: {
            type: "delete",
            gameId
        },
    }
}

export function response(ctx:Context) {
    return ctx.result;
}