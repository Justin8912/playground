import { ObjectId } from "mongodb";
import { initializeCardArray } from "./utility/deckGenerator.js";

const createCards = async (db, gameId) => {
    const arrayOfCards = initializeCardArray();

    for (let row = 0 ; row < arrayOfCards.length; row++) {
        for (let col = 0; col < arrayOfCards[row].length; col++) {
            console.log("Inserting the following card: ",{
                    ...arrayOfCards[row][col], 
                    position: {row, col},
                    gameId: gameId
                } )
            await db.collection("cards").insertOne(
                { 
                    ...arrayOfCards[row][col], 
                    position: {row, col},
                    gameId: new ObjectId(gameId)
                },
                { returnDocument: "after" }
            );   
        }
    }
}


export const resolvers = {
  Query: {
    getGame: async (_, { id }, { db }) => {
        const game = await db.collection("games").findOne({ _id: new ObjectId(id) });
        if (!game) {
            throw new Error(`Game with id ${id} not found`);
        }
        return {
            id: game._id.toString(),
            ruleset: game.ruleset
        };
    },
    ownerInfo: async (_, { team }, { db }) => {
      const cards = await db.collection("cards").find({ owner: team }).toArray();

      return {
        greenCards: cards.filter(c => c.classification === "green"),
        blackCards: cards.filter(c => c.classification === "black"),
      };
    },
  },

  Mutation: {
    createGame: async (_, { ruleSet }, { db }) => {
      const result = await db.collection("games").insertOne({
        ruleset: ruleSet,
        createdAt: new Date(),
      });

      const id = result.insertedId.toString()
      console.log("Here is the result: ",result.insertedId.toString(), result.insertedId )
      await createCards(db, id)

      return {
        id: id,
        ruleset: ruleSet
      };
    },

    updateCard: async (_, { cardInput }, { db }) => {
      const { id, ...fields } = cardInput;

      // update the one card
      const result = await db.collection("cards").findOneAndUpdate(
        { _id: id },
        { $set: fields },
        { returnDocument: "after" }
      );

      if (!result.value) {
        throw new Error(`Card with id ${id} not found`);
      }

      // Fetch the parent game and its cards
      const gameId = result.value.gameId;
      const game = await db.collection("games").findOne({ _id: gameId });
      const cards = await db.collection("cards").find({ gameId }).toArray();

      // Rebuild the 2D array if you’re storing positions
      const grid = [];
      cards.forEach((c) => {
        if (!c.position) return;
        const { row, col } = c.position;
        if (!grid[row]) grid[row] = [];
        grid[row][col] = c;
      });

      return {
        id: game._id.toString(),
        ruleset: game.ruleset,
        cards: grid.length > 0 ? grid : [[]],
      };
    },
  },

  Game: {
    cards: async (parent, _, { db }) => {
        console.log("Game.cards resolver is being called")
      const cards = await db
        .collection("cards")
        .find({ gameId: new ObjectId(parent.id) })
        .toArray();

        console.log("Here are the cards fetched: ", cards)
      const grid = [];
      cards.forEach((card) => {
        if (!card.position) return;
        const { row, col } = card.position;
        if (!grid[row]) grid[row] = [];
        grid[row][col] = {...card, id: card._id};
      });

      return grid.length > 0 ? grid : [[]];
    },
  },
};
