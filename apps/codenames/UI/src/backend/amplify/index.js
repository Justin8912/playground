// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const Team = {
  "BLUE": "Blue",
  "RED": "Red",
  "GREEN1": "Green1",
  "GREEN2": "Green2",
  "NONE": "None"
};

const Ruleset = {
  "DUOS": "duos",
  "MULTIPLAYER": "multiplayer"
};

const Classification = {
  "ASSASSIN": "Assassin",
  "BYSTANDER": "Bystander",
  "CLUE": "Clue"
};

const { Game, Card, CreateGameReturn, DeleteGameReturn } = initSchema(schema);

export {
  Team,
  Ruleset,
  Classification,
  Game,
  Card,
  CreateGameReturn,
  DeleteGameReturn
};