// filepath: /Users/justin.stendara/Documents/Random/playground/codenames/UI/src/components/GameInitializer.tsx
import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, CircularProgress, List, ListItem, ListItemText, Divider, Paper } from '@mui/material';
import { createGame, getAllGames, deleteGame } from '../backend/queries';
import { Ruleset } from '../gql/graphql';
import { useGame } from './Providers/GameProvider';
import { useAppsync } from "./Providers/AppsyncProvider";
export const GameInitializer = ({ onGameCreated }) => {
    const [selectedRuleset, setSelectedRuleset] = useState(null);
    const { setGame } = useGame();
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [gamesData, setGamesData] = useState(null);
    const [gamesLoading, setGamesLoading] = useState(false);
    const [gamesError, setGamesError] = useState(null);
    const client = (useAppsync()).client;
    useEffect(() => {
        const fetchGames = async () => {
            setGamesLoading(true);
            setGamesError(null);
            try {
                const result = await client.graphql({
                    query: getAllGames,
                });
                setGamesData(result.data);
            }
            catch (err) {
                console.log(err);
                setGamesError(err instanceof Error ? err : new Error('Failed to fetch games'));
            }
            finally {
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
            setGamesData(result.data);
        }
        catch (err) {
            console.error('Failed to refetch games:', err);
        }
    };
    const handleRulesetSelect = (ruleset) => {
        setSelectedRuleset(ruleset);
    };
    const handleStartGame = async () => {
        if (!selectedRuleset)
            return;
        setCreateLoading(true);
        setCreateError(null);
        try {
            const result = await client.graphql({
                query: createGame,
                variables: { ruleSet: selectedRuleset }
            });
            const data = result.data;
            if (data === null || data === void 0 ? void 0 : data.createGame) {
                setGame(data.createGame.gameId, selectedRuleset);
                await refetchGames();
                onGameCreated();
            }
        }
        catch (err) {
            console.error('Failed to create game:', err);
            setCreateError(err instanceof Error ? err : new Error('Failed to create game'));
        }
        finally {
            setCreateLoading(false);
        }
    };
    const handleJoinGame = (gameId, ruleset) => {
        setGame(gameId, ruleset);
        onGameCreated();
    };
    const handleDeleteGame = async (gameId, event) => {
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
        }
        catch (err) {
            console.error('Failed to delete game:', err);
        }
        finally {
            setDeleteLoading(false);
        }
    };
    if (createLoading || gamesLoading || deleteLoading)
        return React.createElement(CircularProgress, null);
    if (createError)
        return React.createElement(Typography, { color: "error" },
            "Error: ",
            createError.message);
    if (gamesError)
        return React.createElement(Typography, { color: "error" },
            "Error: ",
            gamesError.message);
    const activeGames = (gamesData === null || gamesData === void 0 ? void 0 : gamesData.getAllGames) || [];
    return (React.createElement(Box, { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, p: 4, maxWidth: 800, margin: "0 auto" },
        React.createElement(Typography, { variant: "h3" }, "Codenames"),
        activeGames.length > 0 && (React.createElement(Paper, { elevation: 3, sx: { width: '100%', p: 2 } },
            React.createElement(Typography, { variant: "h5", gutterBottom: true }, "Active Games"),
            React.createElement(List, null, activeGames.map((game, index) => (React.createElement(React.Fragment, { key: game.PartitionKey },
                index > 0 && React.createElement(Divider, null),
                React.createElement(ListItem, null,
                    React.createElement(ListItemText, { primary: `Game ${game.PartitionKey}...`, secondary: `Mode: ${game.Ruleset}` }),
                    React.createElement(Box, { display: "flex", gap: 1 },
                        React.createElement(Button, { variant: "contained", color: "primary", onClick: () => handleJoinGame(game.PartitionKey, game.Ruleset) }, "Join"),
                        React.createElement(Button, { variant: "outlined", color: "error", onClick: (e) => handleDeleteGame(game.PartitionKey, e) }, "Delete"))))))))),
        React.createElement(Divider, { sx: { width: '100%' } }, "OR"),
        React.createElement(Box, { display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: "100%" },
            React.createElement(Typography, { variant: "h5" }, "Create New Game"),
            React.createElement(Box, { display: "flex", gap: 2 },
                React.createElement(Button, { variant: selectedRuleset === Ruleset.Multiplayer ? 'contained' : 'outlined', onClick: () => handleRulesetSelect(Ruleset.Multiplayer), size: "large" }, "Multiplayer"),
                React.createElement(Button, { variant: selectedRuleset === Ruleset.Duos ? 'contained' : 'outlined', onClick: () => handleRulesetSelect(Ruleset.Duos), size: "large" }, "Duos")),
            React.createElement(Button, { variant: "contained", color: "primary", onClick: handleStartGame, disabled: !selectedRuleset, size: "large" }, "Start New Game"))));
};
