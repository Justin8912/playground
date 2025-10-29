import React, {useState} from 'react';
import { useQuery } from '@apollo/client/react';
import {type FC} from 'react';
import {BoardView} from './BoardView';
import {getGameById} from "../backend/queries";
import {Button} from "@mui/material";

export interface LoadBoardViewProps {
    variables?: {id: string};
}

export const LoadBoardView: FC<LoadBoardViewProps> = ({variables}) => {
    const {error, data, loading} = useQuery(getGameById, {variables});

    if (loading) return <><p>Loading...</p></>;
    if (error) return <p>Error :{error.message}</p>;

    return (
        <div>
            <BoardView cards={data.getGame.cards}/>
        </div>
    );
}