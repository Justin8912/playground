import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { createServer } from "http";
import express from "express";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import fs from "fs";
import path from "path";
import cors from "cors";
import { json } from "body-parser";
import { connectDB } from "./db.js";
import { resolvers } from "./resolvers.js";

const typeDefs = fs.readFileSync(path.resolve("src/schema.graphql"), "utf8");

const db = await connectDB();

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
const httpServer = createServer(app);

// WebSocket server for subscriptions
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

const serverCleanup = useServer(
  {
    schema,
    context: async () => ({ db }),
  },
  wsServer
);

const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();

app.use(
  "/graphql",
  cors(),
  json(),
  expressMiddleware(server, {
    context: async () => ({ db }),
  })
);

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 GraphQL server ready at: http://localhost:${PORT}/graphql`);
  console.log(`🔌 Subscriptions ready at: ws://localhost:${PORT}/graphql`);
});
