import React, {FC, MouseEventHandler} from "react";
import type {Card} from "../../types";
import {useUser} from "../Providers/UserProvider";
import "./CardView.css"
import {useGame} from "../Providers/GameProvider";
import {getElementClassesForRuleset} from "../../util/cardDisplayBusinessRules";

interface RenderCardProps {
    card: Card
    cardSelectHandler: MouseEventHandler<HTMLDivElement>
    isSelected: boolean
}

export const RenderCard: FC<RenderCardProps> = ({ card, cardSelectHandler, isSelected }) => {
    const { role, team } = useUser();
    const { ruleset } = useGame();

    return (
        <div className={getElementClassesForRuleset(card, ruleset, role, team, isSelected)} id={card.PartitionKey} onClick={cardSelectHandler}>
            {card.Word}
        </div>
    );
}