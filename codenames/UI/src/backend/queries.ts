import {gql} from "@apollo/client";

export const createGame = (ruleset: string) => gql`
    createGame(ruleSet: ${ruleset}) {
        id
        ruleset 
        cards {
        classification 
        id
        owner 
        teamLastSelected 
        word
        }
    }
`

export const getGameById = gql`
    query getGame($id: ID!) {
        getGame(id: $id) {
            id
            ruleset 
            cards {
                classification 
                id
                owner 
                teamLastSelected 
                word
            }
        }
    }
`