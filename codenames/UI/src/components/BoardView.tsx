import react, {type FC} from 'react';
import { Grid } from '@mui/material';
import {type Card} from '../types';
import "./BoardView.css";

interface BoardViewProps {
    cards: Card[][];
}
export const BoardView: FC<BoardViewProps> = ({cards}) => {
    console.log(cards)
    const renderGrid = (row: Card[]) => {
        return (
            <Grid container gap="15px">
                {row.map(renderCard)}
            </Grid>
        );
    }

    const renderCard = (card: Card) => {
        const classes = `card`
        return (
            <Grid className={classes} key={card.id} >
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
            { cards.map(renderGrid) }
        </Grid>
    ) 
}