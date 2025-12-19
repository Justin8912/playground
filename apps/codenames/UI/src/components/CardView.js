import React from "react";
import { useUser } from "./Providers/UserProvider";
import "./CardView.css";
import { useGame } from "./Providers/GameProvider";
import { getElementClassesForRuleset } from "../util/cardDisplayBusinessRules";
export const RenderCard = ({ card, cardSelectHandler, isSelected }) => {
    const { role, team } = useUser();
    const { ruleset } = useGame();
    return (React.createElement("div", { className: getElementClassesForRuleset(card, ruleset, role, team, isSelected), id: card.PartitionKey, onClick: cardSelectHandler }, card.Word));
};
