/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n    query getGame($id: ID!) {\n        getGame(id: $id) {\n            id\n            ruleset\n            cards {\n                classification\n                id\n                owner\n                lastSelectedBy\n                word\n                gameId\n            }\n        }\n    }\n": typeof types.GetGameDocument,
    "\n    query getAllGames {\n        getAllGames {\n            id\n            ruleset\n        }\n    }\n": typeof types.GetAllGamesDocument,
    "\n    query ownerInfo($team: Team!) {\n        ownerInfo(team: $team) {\n            greenCards {\n                id\n                word\n                owner\n                classification\n                lastSelectedBy\n                gameId\n            }\n            blackCards {\n                id\n                word\n                owner\n                classification\n                lastSelectedBy\n                gameId\n            }\n        }\n    }\n": typeof types.OwnerInfoDocument,
    "\n    mutation createGame($ruleSet: Ruleset!) {\n        createGame(ruleSet: $ruleSet) {\n            id\n            ruleset \n            cards {\n                classification \n                id\n                owner \n                lastSelectedBy\n                word\n                gameId\n            }\n        }\n    }\n": typeof types.CreateGameDocument,
    "\n    mutation updateCard($cardInput: CardInput!) {\n        updateCard(cardInput: $cardInput) {\n            id\n            ruleset\n            cards {\n                classification\n                id\n                owner\n                lastSelectedBy\n                word\n                gameId\n            }\n        }\n    }\n": typeof types.UpdateCardDocument,
    "\n    mutation deleteGame($id: ID!) {\n        deleteGame(id: $id)\n    }\n": typeof types.DeleteGameDocument,
};
const documents: Documents = {
    "\n    query getGame($id: ID!) {\n        getGame(id: $id) {\n            id\n            ruleset\n            cards {\n                classification\n                id\n                owner\n                lastSelectedBy\n                word\n                gameId\n            }\n        }\n    }\n": types.GetGameDocument,
    "\n    query getAllGames {\n        getAllGames {\n            id\n            ruleset\n        }\n    }\n": types.GetAllGamesDocument,
    "\n    query ownerInfo($team: Team!) {\n        ownerInfo(team: $team) {\n            greenCards {\n                id\n                word\n                owner\n                classification\n                lastSelectedBy\n                gameId\n            }\n            blackCards {\n                id\n                word\n                owner\n                classification\n                lastSelectedBy\n                gameId\n            }\n        }\n    }\n": types.OwnerInfoDocument,
    "\n    mutation createGame($ruleSet: Ruleset!) {\n        createGame(ruleSet: $ruleSet) {\n            id\n            ruleset \n            cards {\n                classification \n                id\n                owner \n                lastSelectedBy\n                word\n                gameId\n            }\n        }\n    }\n": types.CreateGameDocument,
    "\n    mutation updateCard($cardInput: CardInput!) {\n        updateCard(cardInput: $cardInput) {\n            id\n            ruleset\n            cards {\n                classification\n                id\n                owner\n                lastSelectedBy\n                word\n                gameId\n            }\n        }\n    }\n": types.UpdateCardDocument,
    "\n    mutation deleteGame($id: ID!) {\n        deleteGame(id: $id)\n    }\n": types.DeleteGameDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts.ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query getGame($id: ID!) {\n        getGame(id: $id) {\n            id\n            ruleset\n            cards {\n                classification\n                id\n                owner\n                lastSelectedBy\n                word\n                gameId\n            }\n        }\n    }\n"): (typeof documents)["\n    query getGame($id: ID!) {\n        getGame(id: $id) {\n            id\n            ruleset\n            cards {\n                classification\n                id\n                owner\n                lastSelectedBy\n                word\n                gameId\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query getAllGames {\n        getAllGames {\n            id\n            ruleset\n        }\n    }\n"): (typeof documents)["\n    query getAllGames {\n        getAllGames {\n            id\n            ruleset\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query ownerInfo($team: Team!) {\n        ownerInfo(team: $team) {\n            greenCards {\n                id\n                word\n                owner\n                classification\n                lastSelectedBy\n                gameId\n            }\n            blackCards {\n                id\n                word\n                owner\n                classification\n                lastSelectedBy\n                gameId\n            }\n        }\n    }\n"): (typeof documents)["\n    query ownerInfo($team: Team!) {\n        ownerInfo(team: $team) {\n            greenCards {\n                id\n                word\n                owner\n                classification\n                lastSelectedBy\n                gameId\n            }\n            blackCards {\n                id\n                word\n                owner\n                classification\n                lastSelectedBy\n                gameId\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation createGame($ruleSet: Ruleset!) {\n        createGame(ruleSet: $ruleSet) {\n            id\n            ruleset \n            cards {\n                classification \n                id\n                owner \n                lastSelectedBy\n                word\n                gameId\n            }\n        }\n    }\n"): (typeof documents)["\n    mutation createGame($ruleSet: Ruleset!) {\n        createGame(ruleSet: $ruleSet) {\n            id\n            ruleset \n            cards {\n                classification \n                id\n                owner \n                lastSelectedBy\n                word\n                gameId\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation updateCard($cardInput: CardInput!) {\n        updateCard(cardInput: $cardInput) {\n            id\n            ruleset\n            cards {\n                classification\n                id\n                owner\n                lastSelectedBy\n                word\n                gameId\n            }\n        }\n    }\n"): (typeof documents)["\n    mutation updateCard($cardInput: CardInput!) {\n        updateCard(cardInput: $cardInput) {\n            id\n            ruleset\n            cards {\n                classification\n                id\n                owner\n                lastSelectedBy\n                word\n                gameId\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation deleteGame($id: ID!) {\n        deleteGame(id: $id)\n    }\n"): (typeof documents)["\n    mutation deleteGame($id: ID!) {\n        deleteGame(id: $id)\n    }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;