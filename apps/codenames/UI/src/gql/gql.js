/* eslint-disable */
import * as types from './graphql';
const documents = {
    "\n    query getGame($id: ID!) {\n        getGame(gameId: $id) {\n            PartitionKey\n            Ruleset\n            cards {\n                Classification\n                GameId\n                LastSelectedBy\n                Owner\n                PartitionKey\n                Word\n            }\n        }\n    }\n": types.GetGameDocument,
    "\n    query getAllGames {\n        getAllGames {\n            PartitionKey\n            Ruleset\n        }\n    }\n": types.GetAllGamesDocument,
    "\n    mutation createGame($ruleSet: Ruleset!) {\n        createGame(ruleset: $ruleSet) {\n            gameId\n            status\n        }\n    }\n": types.CreateGameDocument,
    "\n    mutation updateCard($cardInput: CardInput!) {\n        updateCard(cardInput: $cardInput) {\n            Classification\n            GameId\n            LastSelectedBy\n            Owner\n            PartitionKey\n            Word\n        }\n    }\n": types.UpdateCardDocument,
    "\n    mutation deleteGame($id: ID!) {\n        deleteGame(gameId: $id) {\n            status\n            message\n        }\n    }\n": types.DeleteGameDocument,
};
export function graphql(source) {
    var _a;
    return (_a = documents[source]) !== null && _a !== void 0 ? _a : {};
}
