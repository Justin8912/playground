import {Context} from "@aws-appsync/utils";

export function request(ctx: Context) {
    return {
        operation: 'Scan',
        filter: {
            expression: "SortKey = :sortKeyVal",
            expressionValues: {
                ":sortKeyVal": "Game"
            }
        }
    }
}

export function response(ctx: Context) {
    
}