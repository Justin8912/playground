import {Context} from "@aws-appsync/utils";

export function request (ctx: Context) {
    const ruleset = ctx.arguments.ruleset;
    return {
        operation: "Invoke",
        payload: {
            type: "create",
            ruleset
        },
    }
}

export function response (ctx: Context) {
    return ctx.result;
}