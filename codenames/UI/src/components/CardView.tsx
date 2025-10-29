import React, {FC} from "react";
import type {Card} from "../types";
import {Grid} from "@mui/material";
import {Role} from "../types/user";
import {useUser} from "./UserProvider";
import "./CardView.css"

interface RenderCardProps {
    card: Card
    cardSelectHandler: Function,
    isSelected: boolean
}

export const RenderCard: FC<RenderCardProps> = ({ card, cardSelectHandler, isSelected }) => {
    const { role, team } = useUser();
    let classes = `card ${(role === Role.Owner) ? card.owner : ""} ${isSelected ? team : ""}`

    return (
        <Grid className={classes} id={card.id} onClick={cardSelectHandler}>
            {card.word}
        </Grid>
    );
}