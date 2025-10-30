import React from 'react';
import { useQuery } from '@apollo/client/react';
import { type FC } from 'react';
import { BoardView } from './BoardView';
import { getGameById } from "../backend/queries";
import { useGame } from './GameProvider';
import { CircularProgress, Typography } from "@mui/material";
import { GetGameQuery, GetGameQueryVariables } from '../gql/graphql';

export const LoadBoardView: FC = () => {
    const { gameId } = useGame();
    const { error, data, loading } = useQuery<GetGameQuery, GetGameQueryVariables>(getGameById, {
        variables: { id: gameId! },
        skip: !gameId
    });

    if (!gameId) return <Typography>No game selected</Typography>;
    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">Error: {error.message}</Typography>;
    if (!data?.getGame) return <Typography>No game data</Typography>;

    return (
        <div>
            <BoardView cards={data.getGame.cards}/>
        </div>
    );
}