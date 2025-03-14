import {handler} from "./Handlers/handler.js";
import middy from "@middy/core";

export const lambdaHandler = middy()
.handler(handler)