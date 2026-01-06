import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import {Card} from '../../gql/graphql.js';
import { useGame } from './GameProvider.js';
import {getGameById, subscribeUpdatedCard} from "../../backend/queries";
import {useAppsync} from "./AppsyncProvider";
import {CircularProgress, Typography} from "@mui/material";
import {useCookies} from "./CookieProvider";

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
    const { clearAllCookies } = useCookies()

    useEffect(() => {
        const fetchGame = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await client.graphql({
                    query: getGameById,
                    variables: { id: gameId }
                });
                // @ts-ignore
                setCards(result?.data?.getGame?.cards as unknown as Card[]);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch game'));
            } finally {
                setLoading(false);
            }
        };

        const setupSubscription = async () => {
            const subscription = await client.graphql({
                query: subscribeUpdatedCard,
                variables: { id: gameId! },
            })
                // @ts-ignore
                .subscribe({
                next: (data) => {
                    console.log("Incoming subscription data: ", data)
                    if (!data || !data?.data?.cardUpdated) {
                        return;
                    }
                    const cardUpdated = data.data.cardUpdated;
                    setCards(prevCards => prevCards?.map(card => card.PartitionKey === cardUpdated.PartitionKey ? cardUpdated : card ) ?? [] );
                },
                error: (error) => {
                    console.warn("Is is possible that the game has been deleted." , error);
                    clearAllCookies();
                },
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

