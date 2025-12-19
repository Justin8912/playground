/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Card = {
  __typename?: 'Card';
  Classification?: Maybe<Classification>;
  GameId: Scalars['ID']['output'];
  LastSelectedBy?: Maybe<Team>;
  Owner?: Maybe<Array<Maybe<Team>>>;
  PartitionKey: Scalars['ID']['output'];
  Word: Scalars['String']['output'];
};

export type CardInput = {
  cardId: Scalars['ID']['input'];
  lastSelectedBy: Team;
};

export enum Classification {
  Assassin = 'Assassin',
  Bystander = 'Bystander',
  Clue = 'Clue'
}

export type CreateGameReturn = {
  __typename?: 'CreateGameReturn';
  gameId?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type DeleteGameReturn = {
  __typename?: 'DeleteGameReturn';
  message?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type Game = {
  __typename?: 'Game';
  PartitionKey: Scalars['ID']['output'];
  Ruleset: Ruleset;
  cards: Array<Card>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createGame: CreateGameReturn;
  deleteGame: DeleteGameReturn;
  updateCard: Scalars['Boolean']['output'];
};


export type MutationCreateGameArgs = {
  ruleset: Ruleset;
};


export type MutationDeleteGameArgs = {
  gameId: Scalars['ID']['input'];
};


export type MutationUpdateCardArgs = {
  cardInput: CardInput;
};

export type Query = {
  __typename?: 'Query';
  getAllGames: Array<Game>;
  getGame: Game;
};


export type QueryGetGameArgs = {
  gameId: Scalars['ID']['input'];
};

export enum Ruleset {
  Duos = 'duos',
  Multiplayer = 'multiplayer'
}

export enum Team {
  Blue = 'Blue',
  Green1 = 'Green1',
  Green2 = 'Green2',
  None = 'None',
  Red = 'Red'
}

export type GetGameQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetGameQuery = { __typename?: 'Query', getGame: { __typename?: 'Game', PartitionKey: string, Ruleset: Ruleset, cards: Array<{ __typename?: 'Card', Classification?: Classification | null, GameId: string, LastSelectedBy?: Team | null, Owner?: Array<Team | null> | null, PartitionKey: string, Word: string }> } };

export type GetAllGamesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllGamesQuery = { __typename?: 'Query', getAllGames: Array<{ __typename?: 'Game', PartitionKey: string, Ruleset: Ruleset }> };

export type CreateGameMutationVariables = Exact<{
  ruleSet: Ruleset;
}>;


export type CreateGameMutation = { __typename?: 'Mutation', createGame: { __typename?: 'CreateGameReturn', gameId?: string | null, status: string } };

export type UpdateCardMutationVariables = Exact<{
  cardInput: CardInput;
}>;


export type UpdateCardMutation = { __typename?: 'Mutation', updateCard: boolean };

export type DeleteGameMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteGameMutation = { __typename?: 'Mutation', deleteGame: { __typename?: 'DeleteGameReturn', status: string, message?: string | null } };


export const GetGameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getGame"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getGame"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"gameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"PartitionKey"}},{"kind":"Field","name":{"kind":"Name","value":"Ruleset"}},{"kind":"Field","name":{"kind":"Name","value":"cards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Classification"}},{"kind":"Field","name":{"kind":"Name","value":"GameId"}},{"kind":"Field","name":{"kind":"Name","value":"LastSelectedBy"}},{"kind":"Field","name":{"kind":"Name","value":"Owner"}},{"kind":"Field","name":{"kind":"Name","value":"PartitionKey"}},{"kind":"Field","name":{"kind":"Name","value":"Word"}}]}}]}}]}}]} as unknown as DocumentNode<GetGameQuery, GetGameQueryVariables>;
export const GetAllGamesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getAllGames"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAllGames"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"PartitionKey"}},{"kind":"Field","name":{"kind":"Name","value":"Ruleset"}}]}}]}}]} as unknown as DocumentNode<GetAllGamesQuery, GetAllGamesQueryVariables>;
export const CreateGameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createGame"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ruleSet"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Ruleset"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGame"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ruleSet"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gameId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateGameMutation, CreateGameMutationVariables>;
export const UpdateCardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateCard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cardInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CardInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cardInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cardInput"}}}]}]}}]} as unknown as DocumentNode<UpdateCardMutation, UpdateCardMutationVariables>;
export const DeleteGameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteGame"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteGame"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"gameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<DeleteGameMutation, DeleteGameMutationVariables>;