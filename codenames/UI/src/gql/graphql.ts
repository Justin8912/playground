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
  classification: Classification;
  gameId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  lastSelectedBy?: Maybe<Team>;
  owner: Team;
  word: Scalars['String']['output'];
};

export type CardInput = {
  ids: Array<Scalars['ID']['input']>;
  lastSelectedBy: Team;
};

export enum Classification {
  Black = 'black',
  Bystander = 'bystander',
  Green = 'green'
}

export type Game = {
  __typename?: 'Game';
  cards: Array<Array<Card>>;
  id: Scalars['ID']['output'];
  ruleset: Ruleset;
};

export type Mutation = {
  __typename?: 'Mutation';
  createGame: Game;
  updateCard: Game;
};


export type MutationCreateGameArgs = {
  ruleSet: Ruleset;
};


export type MutationUpdateCardArgs = {
  cardInput: CardInput;
};

export type OwnerInfo = {
  __typename?: 'OwnerInfo';
  blackCards: Array<Card>;
  greenCards: Array<Card>;
};

export type Query = {
  __typename?: 'Query';
  getGame: Game;
  ownerInfo: OwnerInfo;
};


export type QueryGetGameArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOwnerInfoArgs = {
  team: Team;
};

export enum Ruleset {
  Duos = 'Duos',
  Multiplayer = 'Multiplayer'
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


export type GetGameQuery = { __typename?: 'Query', getGame: { __typename?: 'Game', id: string, ruleset: Ruleset, cards: Array<Array<{ __typename?: 'Card', classification: Classification, id: string, owner: Team, lastSelectedBy?: Team | null, word: string, gameId: string }>> } };

export type OwnerInfoQueryVariables = Exact<{
  team: Team;
}>;


export type OwnerInfoQuery = { __typename?: 'Query', ownerInfo: { __typename?: 'OwnerInfo', greenCards: Array<{ __typename?: 'Card', id: string, word: string, owner: Team, classification: Classification, lastSelectedBy?: Team | null, gameId: string }>, blackCards: Array<{ __typename?: 'Card', id: string, word: string, owner: Team, classification: Classification, lastSelectedBy?: Team | null, gameId: string }> } };

export type CreateGameMutationVariables = Exact<{
  ruleSet: Ruleset;
}>;


export type CreateGameMutation = { __typename?: 'Mutation', createGame: { __typename?: 'Game', id: string, ruleset: Ruleset, cards: Array<Array<{ __typename?: 'Card', classification: Classification, id: string, owner: Team, lastSelectedBy?: Team | null, word: string, gameId: string }>> } };

export type UpdateCardMutationVariables = Exact<{
  cardInput: CardInput;
}>;


export type UpdateCardMutation = { __typename?: 'Mutation', updateCard: { __typename?: 'Game', id: string, ruleset: Ruleset, cards: Array<Array<{ __typename?: 'Card', classification: Classification, id: string, owner: Team, lastSelectedBy?: Team | null, word: string, gameId: string }>> } };


export const GetGameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getGame"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getGame"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ruleset"}},{"kind":"Field","name":{"kind":"Name","value":"cards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"classification"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"owner"}},{"kind":"Field","name":{"kind":"Name","value":"lastSelectedBy"}},{"kind":"Field","name":{"kind":"Name","value":"word"}},{"kind":"Field","name":{"kind":"Name","value":"gameId"}}]}}]}}]}}]} as unknown as DocumentNode<GetGameQuery, GetGameQueryVariables>;
export const OwnerInfoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ownerInfo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"team"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Team"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ownerInfo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"team"},"value":{"kind":"Variable","name":{"kind":"Name","value":"team"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"greenCards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"word"}},{"kind":"Field","name":{"kind":"Name","value":"owner"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}},{"kind":"Field","name":{"kind":"Name","value":"lastSelectedBy"}},{"kind":"Field","name":{"kind":"Name","value":"gameId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"blackCards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"word"}},{"kind":"Field","name":{"kind":"Name","value":"owner"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}},{"kind":"Field","name":{"kind":"Name","value":"lastSelectedBy"}},{"kind":"Field","name":{"kind":"Name","value":"gameId"}}]}}]}}]}}]} as unknown as DocumentNode<OwnerInfoQuery, OwnerInfoQueryVariables>;
export const CreateGameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createGame"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ruleSet"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Ruleset"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGame"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ruleSet"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ruleset"}},{"kind":"Field","name":{"kind":"Name","value":"cards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"classification"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"owner"}},{"kind":"Field","name":{"kind":"Name","value":"lastSelectedBy"}},{"kind":"Field","name":{"kind":"Name","value":"word"}},{"kind":"Field","name":{"kind":"Name","value":"gameId"}}]}}]}}]}}]} as unknown as DocumentNode<CreateGameMutation, CreateGameMutationVariables>;
export const UpdateCardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateCard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cardInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CardInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cardInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cardInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ruleset"}},{"kind":"Field","name":{"kind":"Name","value":"cards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"classification"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"owner"}},{"kind":"Field","name":{"kind":"Name","value":"lastSelectedBy"}},{"kind":"Field","name":{"kind":"Name","value":"word"}},{"kind":"Field","name":{"kind":"Name","value":"gameId"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateCardMutation, UpdateCardMutationVariables>;