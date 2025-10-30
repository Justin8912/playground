import { PubSub } from 'graphql-subscriptions';

export const pubsub = new PubSub();

export const EVENTS = {
  GAME_UPDATED: 'GAME_UPDATED',
};

