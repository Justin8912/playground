import { ModelInit, MutableModel } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";

export enum Team {
  BLUE = "Blue",
  RED = "Red",
  GREEN1 = "Green1",
  GREEN2 = "Green2",
  NONE = "None"
}

export enum Ruleset {
  DUOS = "duos",
  MULTIPLAYER = "multiplayer"
}

export enum Classification {
  ASSASSIN = "Assassin",
  BYSTANDER = "Bystander",
  CLUE = "Clue"
}

type EagerGame = {
  readonly PartitionKey: string;
  readonly Ruleset: Ruleset | keyof typeof Ruleset;
  readonly cards: Card[];
}

type LazyGame = {
  readonly PartitionKey: string;
  readonly Ruleset: Ruleset | keyof typeof Ruleset;
  readonly cards: Card[];
}

export declare type Game = LazyLoading extends LazyLoadingDisabled ? EagerGame : LazyGame

export declare const Game: (new (init: ModelInit<Game>) => Game)

type EagerCard = {
  readonly PartitionKey: string;
  readonly Word: string;
  readonly Owner?: Team[] | Array<keyof typeof Team> | null;
  readonly LastSelectedBy?: Team | keyof typeof Team | null;
  readonly Classification?: Classification | keyof typeof Classification | null;
  readonly GameId: string;
}

type LazyCard = {
  readonly PartitionKey: string;
  readonly Word: string;
  readonly Owner?: Team[] | Array<keyof typeof Team> | null;
  readonly LastSelectedBy?: Team | keyof typeof Team | null;
  readonly Classification?: Classification | keyof typeof Classification | null;
  readonly GameId: string;
}

export declare type Card = LazyLoading extends LazyLoadingDisabled ? EagerCard : LazyCard

export declare const Card: (new (init: ModelInit<Card>) => Card)

type EagerCreateGameReturn = {
  readonly status: string;
  readonly gameId?: string | null;
}

type LazyCreateGameReturn = {
  readonly status: string;
  readonly gameId?: string | null;
}

export declare type CreateGameReturn = LazyLoading extends LazyLoadingDisabled ? EagerCreateGameReturn : LazyCreateGameReturn

export declare const CreateGameReturn: (new (init: ModelInit<CreateGameReturn>) => CreateGameReturn)

type EagerDeleteGameReturn = {
  readonly status: string;
  readonly message?: string | null;
}

type LazyDeleteGameReturn = {
  readonly status: string;
  readonly message?: string | null;
}

export declare type DeleteGameReturn = LazyLoading extends LazyLoadingDisabled ? EagerDeleteGameReturn : LazyDeleteGameReturn

export declare const DeleteGameReturn: (new (init: ModelInit<DeleteGameReturn>) => DeleteGameReturn)

