import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Ruleset } from '../../gql/graphql';
import {useCookies} from "./CookieProvider";

interface GameContextType {
  gameId: string | null;
  ruleset: Ruleset | null;
  setGame: (gameId: string, ruleset: Ruleset) => void;
  clearGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
  const cookies = useCookies();
  const [gameId, setGameId] = useState<string | null>(cookies.gameId);
  const [ruleset, setRuleset] = useState<Ruleset | null>(cookies.ruleset);

  const setGame = (newGameId: string, newRuleset: Ruleset) => {
    setGameId(newGameId);
    cookies.setGame(newGameId);
    setRuleset(newRuleset);
    cookies.setRuleset(newRuleset);
  };

  const clearGame = () => {
    setGameId(null);
    cookies.clearGame();
    setRuleset(null);
    cookies.clearRuleset();
  };

  return (
    <GameContext.Provider value={{ gameId, ruleset, setGame, clearGame }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

