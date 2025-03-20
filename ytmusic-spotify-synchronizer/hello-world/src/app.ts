import {handler} from "./Handlers/HandleDispatcher.js";
import middy from "@middy/core";

export const lambdaHandler = middy()
.handler(handler)