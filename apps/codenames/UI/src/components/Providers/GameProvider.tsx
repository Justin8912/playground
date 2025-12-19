import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Ruleset } from '../../gql/graphql';

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
  const [gameId, setGameId] = useState<string | null>(null);
  const [ruleset, setRuleset] = useState<Ruleset | null>(null);

  const setGame = (newGameId: string, newRuleset: Ruleset) => {
    setGameId(newGameId);
    setRuleset(newRuleset);
  };

  const clearGame = () => {
    setGameId(null);
    setRuleset(null);
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

