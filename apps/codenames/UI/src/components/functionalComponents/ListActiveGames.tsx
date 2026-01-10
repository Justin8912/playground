import {Box, Button, Divider, List, ListItem, ListItemText, Paper, Typography} from "@mui/material";
import React, {FC} from "react";
import {GetAllGamesQuery} from "../../gql/graphql";

type ListActiveGamesProps = {
    activeGames: GetAllGamesQuery['getAllGames'],
    handleJoinGame: (gameId: string, ruleset: string) => void,
    handleDeleteGame: (gameId: string, event: React.MouseEvent) => Promise<void>
}

export const ListActiveGames: FC<ListActiveGamesProps> =({activeGames, handleJoinGame, handleDeleteGame}) => {
    return (<>
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
    </>)
}