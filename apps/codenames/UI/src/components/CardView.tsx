import React, {FC} from "react";
import type {Card} from "../types";
import {Grid} from "@mui/material";
import {Role} from "../types/user";
import {useUser} from "./Providers/UserProvider";
import "./CardView.css"
import {useGame} from "./Providers/GameProvider";

interface RenderCardProps {
    card: Card
    cardSelectHandler: Function,
    isSelected: boolean
}


export const RenderCard: FC<RenderCardProps> = ({ card, cardSelectHandler, isSelected }) => {
    const { role, team } = useUser();
    const { ruleset } = useGame();

    const getElementClassesForRuleset = (card: Card) => {
        // There are two ways to distinguish what a cards color should be:
        // 1. If the card is a clue, then the owner should be the card color
        // 2. If the card is not a clue, then the classification should be used
        const getRelevantClass = (card: Card) => {
            if (card.Owner.length > 1 || card.Owner.length === 0) {
                return card.Classification.toLowerCase();
            } else {
                return card.Owner[0].toLowerCase()
            }
        }
        if (ruleset.toLowerCase() === "multiplayer") {
            let classes = `card`
            // Owners in multiplayer should see the color of every card
            classes += (role === Role.Owner) ? ` ${getRelevantClass(card)}` : ""
            // If a player selects a card, it should show their team color
            classes += ((role === Role.Player) && isSelected) ? ` ${team.toLowerCase()}` : ""
            // After a card has been selected, it should show the true owner of the card
            classes += card.LastSelectedBy !== "None" ? ` ${getRelevantClass(card)}` : ""
            return classes;
        } else {

        }
    }

    console.log(getElementClassesForRuleset(card))

    return (
        <Grid className={getElementClassesForRuleset(card)} id={card.PartitionKey} onClick={cardSelectHandler}>
            {card.Word}
        </Grid>
    );
}