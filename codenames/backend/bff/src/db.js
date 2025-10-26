import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI || "mongodb://root:example@localhost:27017";

let client;
let db;

export async function connectDB() {
  if (db) return db;

  client = new MongoClient(uri);
  await client.connect();
  db = client.db("game_db");

  console.log("✅ Connected to MongoDB");
  return db;
}
