import React, { useState } from 'react';
import { Button, Grid } from '@mui/material';
import "./BoardView.css";
import { RenderCard } from "./CardView";
import { useUser } from "./Providers/UserProvider";
import { updateCard } from "../backend/queries";
import { useAppsync } from './Providers/AppsyncProvider';
const updateCardMutation = async (client, cardId, team) => {
    await client.graphql({
        query: updateCard,
        variables: {
            cardInput: {
                cardId,
                lastSelectedBy: team
            }
        }
    });
};
export const BoardView = ({ cards }) => {
    const [selectedCards, setSelectedCards] = useState([]);
    const { team } = useUser();
    const client = (useAppsync()).client;
    const lockIn = async () => {
        if (!team) {
            console.error('No team selected');
            return;
        }
        try {
            for (const cardId of selectedCards) {
                await updateCardMutation(client, cardId, team);
            }
            // Clear selected cards after successful mutation
            setSelectedCards([]);
        }
        catch (error) {
            console.error('Error updating cards:', error);
        }
    };
    const cardSelectHandler = (e) => {
        const target = e.target;
        const cardId = target.id;
        if (!selectedCards.includes(cardId)) {
            setSelectedCards([...selectedCards, cardId]);
        }
        else {
            setSelectedCards(selectedCards.filter(id => id !== cardId));
        }
    };
    return (React.createElement(Grid, { id: "BoardView", container: true, gap: "15px", flexDirection: "row", maxWidth: "600px" },
        cards.map(card => React.createElement(RenderCard, { card: card, key: card.PartitionKey, cardSelectHandler: cardSelectHandler, isSelected: selectedCards.includes(card.PartitionKey) })),
        React.createElement(Button, { onClick: lockIn, style: { "display": `${(selectedCards.length > 0) ? "" : "none"}` } },
            "Lock in ",
            selectedCards.length,
            " card(s)")));
};
