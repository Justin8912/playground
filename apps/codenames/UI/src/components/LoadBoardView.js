import React from 'react';
import { BoardView } from './BoardView';
import { useCardProvider } from './Providers/providers';
export const LoadBoardView = () => {
    const { cards } = useCardProvider();
    return (React.createElement("div", null,
        React.createElement(BoardView, { cards: cards })));
};
