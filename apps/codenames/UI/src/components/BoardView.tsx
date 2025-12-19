import React, {type FC, useState} from 'react';
import {Button, Grid} from '@mui/material';
import {type Card} from '../types';
import "./BoardView.css";
import {RenderCard} from "./CardView";
import {useUser} from "./Providers/UserProvider";
import {updateCard} from "../backend/queries";
import { useAppsync } from './Providers/AppsyncProvider';
import {V6Client} from "@aws-amplify/api-graphql";

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
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const { team } = useUser();
    const client = (useAppsync()).client;
    const lockIn = async () => {
        if (!team) {
            console.error('No team selected');
            return;
        }

        try {
            for (const cardId of selectedCards) {
                await updateCardMutation(client, cardId, team)
            }
            // Clear selected cards after successful mutation
            setSelectedCards([]);
        } catch (error) {
            console.error('Error updating cards:', error);
        }
    };

    const cardSelectHandler = (e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        const cardId = target.id;
        if (!selectedCards.includes(cardId)) {
            setSelectedCards([...selectedCards, cardId]);
        } else {
            setSelectedCards(selectedCards.filter(id => id !== cardId))
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
                    isSelected={selectedCards.includes(card.PartitionKey)}
                />
            ) }

            <Button onClick={lockIn} style={{"display": `${(selectedCards.length > 0) ? "" : "none"}`}}>Lock in {selectedCards.length} card(s)</Button>
        </Grid>
    ) 
}