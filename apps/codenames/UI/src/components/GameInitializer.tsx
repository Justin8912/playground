import React, { useState, useEffect } from 'react';
import { type FC } from 'react';
import { Box, Typography, CircularProgress, Divider } from '@mui/material';
import { getAllGames, deleteGame } from '../backend/queries';
import { Ruleset, GetAllGamesQuery } from '../gql/graphql';
import { useGame } from './Providers/GameProvider';
import {useAppsync} from "./Providers/AppsyncProvider";
import { GraphQLResult } from 'aws-amplify/api';
import { LogoutButton } from './LogoutButton';
import {CreateGameDisplay} from "./functionalComponents/CreateGameDisplay";
import {ListActiveGames} from "./functionalComponents/ListActiveGames";

export const GameInitializer: FC = () => {
  const { setGame } = useGame();
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<Error | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [gamesData, setGamesData] = useState<GetAllGamesQuery | null>(null);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [gamesError, setGamesError] = useState<Error | null>(null);

  const client = (useAppsync()).client;
  useEffect(() => {
    const fetchGames = async () => {
      setGamesLoading(true);
      setGamesError(null);
      try {
        const result = await client.graphql({
          query: getAllGames,
        }) as GraphQLResult<any>;
        setGamesData(result.data as GetAllGamesQuery);
      } catch (err) {
        console.log(err);
        setGamesError(err instanceof Error ? err : new Error('Failed to fetch games'));
      } finally {
        setGamesLoading(false);
      }
    };

    fetchGames();
  }, []);

  const refetchGames = async () => {
    try {
      const result = await client.graphql({
        query: getAllGames
      });
      // @ts-ignore
      setGamesData(result.data as unknown as GetAllGamesQuery);
    } catch (err) {
      console.error('Failed to refetch games:', err);
    }
  };

  const handleJoinGame = (gameId: string, ruleset: Ruleset) => {
    setGame(gameId, ruleset);
  };

  const handleDeleteGame = async (gameId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this game?')) {
      return;
    }

    setDeleteLoading(true);
    try {
      await client.graphql({
        query: deleteGame,
        variables: { id: gameId }
      });
      await refetchGames();
    } catch (err) {
      console.error('Failed to delete game:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (createLoading || gamesLoading || deleteLoading) return <CircularProgress />;
  if (createError) return <Typography color="error">Error: {createError.message}</Typography>;
  if (gamesError) return <Typography color="error">Error: {gamesError.message}</Typography>;

  const activeGames = gamesData?.getAllGames || [];

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={4} p={4} maxWidth={800} margin="0 auto">
      <LogoutButton/>
      <Typography variant="h3">Codenames</Typography>

      <ListActiveGames
        activeGames={activeGames}
        handleJoinGame={handleJoinGame}
        handleDeleteGame={handleDeleteGame}
      />

      <Divider sx={{ width: '100%' }}>OR</Divider>

      <CreateGameDisplay
        setCreateLoading={setCreateLoading}
        setCreateError={setCreateError}
        refetchGames={refetchGames}
      />
    </Box>
  );
};

