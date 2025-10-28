import React, {type FC} from 'react';
import { Grid } from '@mui/material';
import {type Card} from '../types';
import "./BoardView.css";

interface BoardViewProps {
    cards: Card[][];
};

export const BoardView: FC<BoardViewProps> = ({cards}) => {
    const handleCardSelect = (e) => {

    }

    const RenderGrid: FC<{row: Card[]}> = ({ row }) => {
        return (
            <Grid container gap="15px">
                {row.map(card =>
                    <RenderCard card={card} />
                )}
            </Grid>
        );
    }

    const RenderCard: FC<{ card: Card }> = ({ card }) => {
        let classes = `card`


        return (
            <Grid className={classes} id={card.id} onClick={handleCardSelect}>
                {card.word}
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
                <RenderGrid row={row}/>
            )) }
        </Grid>
    ) 
}