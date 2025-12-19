import React from 'react';
import { type FC } from 'react';
import { BoardView } from './BoardView';
import {useCardProvider} from './Providers/providers';

export const LoadBoardView: FC = () => {
    const {cards} = useCardProvider()

    return (
        <div>
            <BoardView cards={cards}/>
        </div>
    );
}