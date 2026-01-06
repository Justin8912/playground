import React, {type FC, useState} from 'react';
import {Button, Grid} from '@mui/material';
import {type Card} from '../types';
import "./BoardView.css";
import {RenderCard} from "./CardView";
import {useUser} from "./Providers/UserProvider";
import {updateCard} from "../backend/queries";
import { useAppsync } from './Providers/AppsyncProvider';
import {V6Client} from "@aws-amplify/api-graphql";
import {useGame} from "./Providers/GameProvider";

interface BoardViewProps {
    cards: Card[];
}

const updateCardMutation = async (client: V6Client, cardId, team) => {
    await client.graphql({
        query: updateCard,
        variables: {
            cardInput: {
                cardId,
                lastSelectedBy: team
            }
        }
    });
}

export const BoardView: FC<BoardViewProps> = ({cards}) => {
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const { role, team } = useUser();
    const { ruleset } = useGame();
    const client = (useAppsync()).client;
    const lockIn = async () => {
        if (!team) {
            console.error('No team selected');
            return;
        }

        try {
            await updateCardMutation(client, selectedCard, team);
            // Clear selected cards after successful mutation
            setSelectedCard(null);
        } catch (error) {
            console.error('Error updating cards:', error);
        }
    };

    const cardSelectHandler = (e: React.MouseEvent<HTMLElement>) => {
        if (role !== "player" && ruleset === "multiplayer" ) {
            return;
        }

        const target = e.target as HTMLElement;
        const cardId = target.id;
        const currentCard = cards.filter(card => card.PartitionKey === cardId)[0];
        if (currentCard.LastSelectedBy !== "None") {
            return;
        }

        if (selectedCard === cardId) {
            setSelectedCard(null);
        } else {
            setSelectedCard(cardId);
        }
    }

    return (
        <Grid 
            id={"BoardView"}
            container 
            gap="15px"
            flexDirection="row"
            maxWidth={"600px"}
        >
            { cards.map(card =>
                <RenderCard
                    card={card}
                    key={card.PartitionKey}
                    cardSelectHandler={cardSelectHandler}
                    isSelected={selectedCard === card.PartitionKey}
                />
            ) }

            <Button
                onClick={lockIn}
                style={{"visibility": (selectedCard !== null) ? "visible" : "hidden", height: "40px"}}
                id={"submit-selection"}
            >
                Lock in
            </Button>
        </Grid>
    ) 
}