// filepath: /Users/justin.stendara/Documents/Random/playground/codenames/UI/src/components/GameInitializer.tsx
import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { type FC } from 'react';
import { Button, Box, Typography, CircularProgress, List, ListItem, ListItemText, Divider, Paper } from '@mui/material';
import { createGame, getAllGames, deleteGame } from '../backend/queries';
import { Ruleset, GetAllGamesQuery, CreateGameMutation, CreateGameMutationVariables, DeleteGameMutation, DeleteGameMutationVariables } from '../gql/graphql';
import { useGame } from './GameProvider';

export interface GameInitializerProps {
  onGameCreated: () => void;
}

export const GameInitializer: FC<GameInitializerProps> = ({ onGameCreated }) => {
  const [selectedRuleset, setSelectedRuleset] = useState<Ruleset | null>(null);
  const { setGame } = useGame();
  const [createGameMutation, { loading: createLoading, error: createError }] = useMutation<CreateGameMutation, CreateGameMutationVariables>(createGame, {
    refetchQueries: [{ query: getAllGames }]
  });
  const [deleteGameMutation, { loading: deleteLoading }] = useMutation<DeleteGameMutation, DeleteGameMutationVariables>(deleteGame, {
    refetchQueries: [{ query: getAllGames }]
  });
  const { data: gamesData, loading: gamesLoading, error: gamesError } = useQuery<GetAllGamesQuery>(getAllGames);

  const handleRulesetSelect = (ruleset: Ruleset) => {
    setSelectedRuleset(ruleset);
  };

  const handleStartGame = async () => {
    if (!selectedRuleset) return;

    try {
      const { data } = await createGameMutation({
        variables: { ruleSet: selectedRuleset }
      });

      if (data?.createGame) {
        setGame(data.createGame.id, data.createGame.ruleset);
        onGameCreated();
      }
    } catch (err) {
      console.error('Failed to create game:', err);
    }
  };

  const handleJoinGame = (gameId: string, ruleset: Ruleset) => {
    setGame(gameId, ruleset);
    onGameCreated();
  };

  const handleDeleteGame = async (gameId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this game?')) {
      return;
    }

    try {
      await deleteGameMutation({
        variables: { id: gameId }
      });
    } catch (err) {
      console.error('Failed to delete game:', err);
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
              <React.Fragment key={game.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={`Game ${game.id.substring(0, 8)}...`}
                    secondary={`Mode: ${game.ruleset}`}
                  />
                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleJoinGame(game.id, game.ruleset)}
                    >
                      Join
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={(e) => handleDeleteGame(game.id, e)}
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

