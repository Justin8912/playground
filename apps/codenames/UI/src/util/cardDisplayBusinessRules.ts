import { Role } from "../components";
import {Card, Team} from "../gql/graphql";
// TODO: Clean up these business rules
const getRelevantMultiplayerClass = (card: Card) => {
    if (card.Owner.length === 1) {
        return card.Owner[0].toLowerCase()
    } else {
        return card.Classification.toLowerCase();
    }
}

const getRelevantDuosClass = (card: Card, team, isSelected) => {
    if (card.Classification === "Assassin" && (card.Owner.includes(team) || card.LastSelectedBy !== "None")) {
        return "assassin";
    } else if (card.LastSelectedBy !== "None") {
        if (card.Owner.length === 0 || card.Owner.length == 1 && card.Owner.includes(card.LastSelectedBy)) {
            return `bystander ${card.Owner.includes(team) ?team.toLowerCase() : ""}`;
        }
        return 'revealed'
    } else if (isSelected) {
        return getOppositeTeam(team).toLowerCase();
    } else if (card.Owner.includes(team)) {
        return team.toLowerCase();
    }
}

const getOppositeTeam = (team: Team) => {
    return team === "Green1" ? "Green2" : "Green1"
}

export const getElementClassesForRuleset = (card: Card, ruleset, role, team: Team, isSelected: boolean) => {
    // There are two ways to distinguish what a cards color should be:
    // 1. If the card is a clue, then the owner should be the card color
    // 2. If the card is not a clue, then the classification should be used
    if (ruleset.toLowerCase() === "multiplayer") {
        let classes = `card`
        // Owners in multiplayer should see the color of every card
        classes += (role === Role.Owner) ? ` ${getRelevantMultiplayerClass(card)}` : ""
        // If a player selects a card, it should show their team color
        classes += ((role === Role.Player) && isSelected) ? ` ${team.toLowerCase()}` : ""
        classes += (card.LastSelectedBy !== "None") ? ` ${getRelevantMultiplayerClass(card)}` : "";
        return classes;
    } else {
        return`card ${getRelevantDuosClass(card, team, isSelected)}`;
    }
}