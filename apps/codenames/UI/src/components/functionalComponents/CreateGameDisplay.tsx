import {Dispatch, FC, SetStateAction, useState} from "react";
import {Box, Button, Typography} from "@mui/material";
import {CreateGameMutation, Ruleset} from "../../gql/graphql";
import React from "react";
import {createGame} from "../../backend/queries";
import {useAppsync} from "../Providers/AppsyncProvider";
import {useGame} from "../Providers/GameProvider";
import {GraphQLResult} from "aws-amplify/api";

type CreateGameDisplayProps = {
    setCreateLoading: Dispatch<SetStateAction<boolean>>
    setCreateError: Dispatch<SetStateAction<Error | null>>
    refetchGames: () => Promise<void>
}

export const CreateGameDisplay: FC<CreateGameDisplayProps> = ({setCreateLoading, setCreateError, refetchGames}) => {
    const client = (useAppsync()).client;
    const { setGame } = useGame();
    const [selectedRuleset, setSelectedRuleset] = useState<Ruleset | null>(null);

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
            }) as GraphQLResult<CreateGameMutation>;

            const response = result?.data.createGame;
            if (response) {
                setGame(response.gameId, selectedRuleset);
                await refetchGames();
            }
        } catch (err) {
            console.error('Failed to create game:', err);
            setCreateError(err instanceof Error ? err : new Error('Failed to create game'));
        } finally {
            setCreateLoading(false);
        }
    };

    return (<>
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
    </>)
}