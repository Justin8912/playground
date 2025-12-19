import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGame } from './GameProvider.js';
import { getGameById, subscribeUpdatedCard } from "../../backend/queries";
import { useAppsync } from "./AppsyncProvider";
import { CircularProgress, Typography } from "@mui/material";
const CardProviderContext = createContext(undefined);
export const CardProvider = ({ children }) => {
    const { gameId } = useGame();
    const client = (useAppsync()).client;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cards, setCards] = useState(null);
    useEffect(() => {
        const fetchGame = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await client.graphql({
                    query: getGameById,
                    variables: { id: gameId }
                });
                setCards(result.data.getGame.cards);
                console.log("Gettign the card data: ", result.data.getGame.cards);
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch game'));
            }
            finally {
                setLoading(false);
            }
        };
        const setupSubscription = () => {
            const subscription = client.graphql({
                query: subscribeUpdatedCard,
                variables: { id: gameId },
            }).subscribe({
                next: (data) => {
                    var _a;
                    if (!data || !((_a = data === null || data === void 0 ? void 0 : data.data) === null || _a === void 0 ? void 0 : _a.cardUpdated)) {
                        return;
                    }
                    const cardUpdated = data.data.cardUpdated;
                    setCards(prevCards => { var _a; return (_a = prevCards === null || prevCards === void 0 ? void 0 : prevCards.map(card => card.PartitionKey === cardUpdated.PartitionKey ? cardUpdated : card)) !== null && _a !== void 0 ? _a : []; });
                },
                error: (error) => console.warn(error),
            });
            return () => subscription.unsubscribe();
        };
        fetchGame();
        setupSubscription();
    }, []);
    return (React.createElement(CardProviderContext.Provider, { value: { cards } },
        error ? React.createElement(Typography, { color: "error" },
            "Error: ",
            error.message) : null,
        loading ? React.createElement(CircularProgress, null) : children));
};
export const useCardProvider = () => {
    const context = useContext(CardProviderContext);
    if (context === undefined) {
        throw new Error('useAppsync must be used within an AppsyncProvider');
    }
    return context;
};
