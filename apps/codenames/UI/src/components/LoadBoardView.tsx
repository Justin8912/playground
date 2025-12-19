import React, { useEffect, useState } from 'react';
import { type FC } from 'react';
import { BoardView } from './BoardView';
import { getGameById } from "../backend/queries";
import { useGame } from './Providers/GameProvider';
import { CircularProgress, Typography } from "@mui/material";
import { GetGameQuery } from '../gql/graphql';
import { useAppsync } from './Providers/providers';

export const LoadBoardView: FC = () => {
    const { gameId } = useGame();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<GetGameQuery | null>(null);
    const client = (useAppsync()).client;

    useEffect(() => {
        if (!gameId) return;

        const fetchGame = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await client.graphql({
                    query: getGameById,
                    variables: { id: gameId }
                });
                setData(result.data as GetGameQuery);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch game'));
            } finally {
                setLoading(false);
            }
        };

        fetchGame();
    }, [gameId]);

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