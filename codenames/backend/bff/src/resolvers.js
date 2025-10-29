import { ObjectId } from "mongodb";
import { initializeCardArray } from "./utility/deckGenerator.js";

const createCards = async (db, gameId) => {
    const arrayOfCards = initializeCardArray();

    for (let row = 0 ; row < arrayOfCards.length; row++) {
        for (let col = 0; col < arrayOfCards[row].length; col++) {
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
      await createCards(db, id)

      return {
        id: id,
      };
    },

    updateCard: async (_, { cardInput }, { db }) => {
      const { ids, lastSelectedBy } = cardInput;

      const objectIds = ids.map(id => new ObjectId(id));
      const result = await db.collection("cards").updateMany(
        { _id: { $in: objectIds } },
        { $set: { lastSelectedBy } }
      );

      if (result.matchedCount === 0) {
        throw new Error(`No cards found with provided ids`);
      }

      const sampleCard = await db.collection("cards").findOne({ _id: objectIds[0] });
      if (!sampleCard) {
        throw new Error(`Card not found after update`);
      }

      const gameId = sampleCard.gameId;
      const game = await db.collection("games").findOne({ _id: gameId });

      return {
        id: game._id.toString(),
      };
    },
  },

  Game: {
    cards: async (parent, _, { db }) => {
        // console.log("Game.cards resolver is being called")
      const cards = await db
        .collection("cards")
        .find({ gameId: new ObjectId(parent.id) })
        .toArray();

        // console.log("Here are the cards fetched: ", cards)
      const grid = [];
      cards.forEach((card) => {
        if (!card.position) return;
        const { row, col } = card.position;
        if (!grid[row]) grid[row] = [];
        grid[row][col] = {...card, id: card._id};
      });

      return grid.length > 0 ? grid : [[]];
    },

    ruleset: async (parent, _, { db }) => {
      const game = await db.collection("games").findOne({ _id: new ObjectId(parent.id) });
      return game.ruleset;
    }
  },
};
