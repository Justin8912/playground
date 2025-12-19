import React, {FC} from "react";
import type {Card} from "../types";
import {Grid} from "@mui/material";
import {Role} from "../types/user";
import {useUser} from "./Providers/UserProvider";
import "./CardView.css"
import {useGame} from "./Providers/GameProvider";
import {Team} from "../gql/graphql";

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
        const getRelevantMultiplayerClass = (card: Card) => {
            if (card.Owner.length === 1 || card.LastSelectedBy !== "None") {
                return card.Owner[0].toLowerCase()
            } else {
                return card.Classification.toLowerCase();
            }
        }

        const getRelevantDuosClass = (card: Card) => {
            if (card.Classification === "Assassin" && (card.Owner.includes(team) || card.LastSelectedBy !== "None")) {
                return "assassin";
            } else if (card.LastSelectedBy !== "None") {
                if (card.Owner.length === 0 || card.Owner.length == 1 && card.Owner.includes(card.LastSelectedBy)) {
                    return 'bystander';
                }
                return 'revealed'
            } else if (card.Owner.includes(team)) {
                return team.toLowerCase();
            }
        }

        const getOppositeTeam = (team: Team) => {
            return team === "Green1" ? "Green2" : "Green1"
        }
        if (ruleset.toLowerCase() === "multiplayer") {
            let classes = `card`
            // Owners in multiplayer should see the color of every card
            classes += (role === Role.Owner) ? ` ${getRelevantMultiplayerClass(card)}` : ""
            // If a player selects a card, it should show their team color
            classes += ((role === Role.Player) && isSelected) ? ` ${team.toLowerCase()}` : ""
            return classes;
        } else {
            return`card ${getRelevantDuosClass(card)} ${isSelected ? getOppositeTeam(team) : ""}`;
        }
    }

    return (
        <Grid className={getElementClassesForRuleset(card)} id={card.PartitionKey} onClick={cardSelectHandler}>
            {card.Word}
        </Grid>
    );
}