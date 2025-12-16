import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import fs from "fs";
import path from "path";
import { connectDB } from "./db.js";
import { resolvers } from "./resolvers.js";

const typeDefs = fs.readFileSync(path.resolve("src/schema.graphql"), "utf8");

const db = await connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  context: async () => ({ db }),
  listen: { port: 4000 },
});

console.log(`🚀 GraphQL server ready at: ${url}`);
