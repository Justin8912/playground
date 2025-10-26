import react, {type FC} from 'react';
import { Grid } from '@mui/material';
import {type Card} from '../types';
import "./BoardView.css";

interface BoardViewProps {
    cards: Card[][];
}
export const BoardView: FC<BoardViewProps> = ({cards}) => {
    console.log("Board asdfView: ", cards);
    return (
        <Grid 
            id={"BoardView"}
            container 
            gap="15px"
            flexDirection="column"
        >
            { 
                cards.map((row) => {
                    return (
                    <Grid 
                        container
                        className="row"
                        gap="15px"
                    >
                        {
                            row.map((card) => (
                                <Grid
                                  className="card"
                                >
                                    {card.word}
                                </Grid>
                            ))
                        }
                    </Grid>
                    )
                })
            }
        </Grid>
    ) 
}