import React, { useState, useEffect } from 'react';
import { type FC } from 'react';
import { Button, Box, Typography, CircularProgress, List, ListItem, ListItemText, Divider, Paper } from '@mui/material';
import { createGame, getAllGames, deleteGame } from '../backend/queries';
import { Ruleset, GetAllGamesQuery, CreateGameMutation } from '../gql/graphql';
import { useGame } from './Providers/GameProvider';
import {useAppsync} from "./Providers/AppsyncProvider";
import { GraphQLResult } from 'aws-amplify/api';


export const GameInitializer: FC = () => {
  const [selectedRuleset, setSelectedRuleset] = useState<Ruleset | null>(null);
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

  const handleRulesetSelect = (ruleset: Ruleset) => {
    setSelectedRuleset(ruleset);
  };

  const handleStartGame = async () => {
    if (!selectedRuleset) return;

    setCreateLoading(true);
    setCreateError(null);
    try {
      const result = await client.graphql({
        query: createGame,
        variables: { ruleSet: selectedRuleset }
      });

      // @ts-ignore
      const data = result?.data as unknown as CreateGameMutation;
      if (data?.createGame) {
        setGame(data.createGame.gameId, selectedRuleset);
        await refetchGames();
      }
    } catch (err) {
      console.error('Failed to create game:', err);
      setCreateError(err instanceof Error ? err : new Error('Failed to create game'));
    } finally {
      setCreateLoading(false);
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
      <Typography variant="h3">Codenames</Typography>

      {activeGames.length > 0 && (
        <Paper elevation={3} sx={{ width: '100%', p: 2 }}>
          <Typography variant="h5" gutterBottom>Active Games</Typography>
          <List>
            {activeGames.map((game, index) => (
              <React.Fragment key={game.PartitionKey}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={`Game ${game.PartitionKey}...`}
                    secondary={`Mode: ${game.Ruleset}`}
                  />
                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleJoinGame(game.PartitionKey, game.Ruleset)}
                    >
                      Join
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={(e) => handleDeleteGame(game.PartitionKey, e)}
                    >
                      Delete
                    </Button>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      <Divider sx={{ width: '100%' }}>OR</Divider>

      <Box display="flex" flexDirection="column" alignItems="center" gap={2} width="100%">
        <Typography variant="h5">Create New Game</Typography>

        <Box display="flex" gap={2}>
          <Button
            variant={selectedRuleset === Ruleset.Multiplayer ? 'contained' : 'outlined'}
            onClick={() => handleRulesetSelect(Ruleset.Multiplayer)}
            size="large"
          >
            Multiplayer
          </Button>
          <Button
            variant={selectedRuleset === Ruleset.Duos ? 'contained' : 'outlined'}
            onClick={() => handleRulesetSelect(Ruleset.Duos)}
            size="large"
          >
            Duos
          </Button>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={handleStartGame}
          disabled={!selectedRuleset}
          size="large"
        >
          Start New Game
        </Button>
      </Box>
    </Box>
  );
};

