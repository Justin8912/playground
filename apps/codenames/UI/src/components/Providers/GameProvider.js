import React, { createContext, useContext, useState } from 'react';
const GameContext = createContext(undefined);
export const GameProvider = ({ children }) => {
    const [gameId, setGameId] = useState(null);
    const [ruleset, setRuleset] = useState(null);
    const setGame = (newGameId, newRuleset) => {
        setGameId(newGameId);
        setRuleset(newRuleset);
    };
    const clearGame = () => {
        setGameId(null);
        setRuleset(null);
    };
    return (React.createElement(GameContext.Provider, { value: { gameId, ruleset, setGame, clearGame } }, children));
};
export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
