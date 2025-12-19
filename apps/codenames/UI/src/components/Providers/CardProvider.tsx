import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Amplify } from 'aws-amplify';
import config from '../../security/aws-exports.js';
import type {V6Client} from "@aws-amplify/api-graphql";
import {Card, GetGameQuery} from '../../gql/graphql.js';
import { useGame } from './GameProvider.js';
import {getGameById, subscribeUpdatedCard} from "../../backend/queries";
import {useAppsync} from "./AppsyncProvider";
import {CircularProgress, Typography} from "@mui/material";

interface CardProviderContextType {
    cards: Card[]
}

const CardProviderContext = createContext<CardProviderContextType | undefined>(undefined);

interface CardProviderProps {
    children: ReactNode;
}

export const CardProvider = ({ children }: CardProviderProps) => {
    const { gameId } = useGame();
    const client = (useAppsync()).client;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [cards, setCards] = useState<Card[] | null>(null);

    useEffect(() => {
        const fetchGame = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await client.graphql({
                    query: getGameById,
                    variables: { id: gameId }
                });
                setCards(result.data.getGame.cards as GetGameQuery);
                console.log("Gettign the card data: ", result.data.getGame.cards)
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch game'));
            } finally {
                setLoading(false);
            }
        };

        const setupSubscription = () => {
            const subscription = client.graphql({
                query: subscribeUpdatedCard,
                variables: { id: gameId! },
            }).subscribe({
                next: (data) => {
                    if (!data || !data?.data?.cardUpdated) {
                        return;
                    }
                    const cardUpdated = data.data.cardUpdated;
                    setCards(prevCards => prevCards?.map(card => card.PartitionKey === cardUpdated.PartitionKey ? cardUpdated : card ) ?? [] );
                },
                error: (error) => console.warn(error),
            });
            return () => subscription.unsubscribe();
        }

        fetchGame();
        setupSubscription()
    }, [])
    return (
        <CardProviderContext.Provider value={{ cards }}>
            {error ? <Typography color="error">Error: {error.message}</Typography> : null}
            {loading ? <CircularProgress />: children}
        </CardProviderContext.Provider>
    );
};

export const useCardProvider = () => {
    const context = useContext(CardProviderContext);
    if (context === undefined) {
        throw new Error('useAppsync must be used within an AppsyncProvider');
    }
    return context;
};

