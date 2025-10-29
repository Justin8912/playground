import React, {type FC, useState} from 'react';
import {Button, Grid} from '@mui/material';
import {type Card} from '../types';
import "./BoardView.css";
import {RenderCard} from "./CardView";
import {useUser} from "./UserProvider";
import {useMutation} from "@apollo/client/react";
import {updateCard} from "../backend/queries";

interface BoardViewProps {
    cards: Card[][];
}

export const BoardView: FC<BoardViewProps> = ({cards}) => {
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const { team } = useUser();
    const [updateCardMutation] = useMutation(updateCard);

    const lockIn = async () => {
        if (!team) {
            console.error('No team selected');
            return;
        }

        try {
            await updateCardMutation({
                variables: {
                    cardInput: {
                        ids: selectedCards,
                        lastSelectedBy: team
                    }
                }
            });
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

    const RenderGrid: FC<{row: Card[]}> = ({ row }) => {
        return (
            <Grid container gap="15px">
                {row.map(card =>
                    <RenderCard
                        card={card}
                        key={card.id}
                        cardSelectHandler={cardSelectHandler}
                        isSelected={selectedCards.includes(card.id)}
                    />
                )}
            </Grid>
        );
    }

    return (
        <Grid 
            id={"BoardView"}
            container 
            gap="15px"
            flexDirection="column"
        >
            { cards.map(row => (
                <RenderGrid key={row.map(card=>card.id).join("")} row={row}/>
            )) }

            {selectedCards.length > 0 && (
                <Button onClick={lockIn}>Lock in {selectedCards.length} card(s)</Button>
            )}
        </Grid>
    ) 
}