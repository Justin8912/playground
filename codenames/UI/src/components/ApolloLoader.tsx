import React from 'react';
import { type DocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import {type FC} from 'react';
import {BoardView} from './BoardView';

export interface LoadBoardViewProps {
    query: DocumentNode,
    variables?: {[key: string]: any};
}

export const LoadBoardView: FC<LoadBoardViewProps> = ({query, variables}) => {
    const {error, data, loading} = useQuery(query, {variables});
    
    if (loading) return <><p>Loading...</p></>;
    if (error) return <p>Error :{error.message}</p>;

    console.log(error);

    return (
        <div>
            <BoardView cards={data.getGame.cards} />
        </div>
    );
}