import {gql} from "@apollo/client";

// Queries
export const getGameById = gql`
    query getGame($id: ID!) {
        getGame(id: $id) {
            id
            ruleset
            cards {
                classification
                id
                owner
                lastSelectedBy
                word
                gameId
            }
        }
    }
`

export const getAllGames = gql`
    query getAllGames {
        getAllGames {
            id
            ruleset
        }
    }
`

export const getOwnerInfo = gql`
    query ownerInfo($team: Team!) {
        ownerInfo(team: $team) {
            greenCards {
                id
                word
                owner
                classification
                lastSelectedBy
                gameId
            }
            blackCards {
                id
                word
                owner
                classification
                lastSelectedBy
                gameId
            }
        }
    }
`

// Mutations
export const createGame = gql`
    mutation createGame($ruleSet: Ruleset!) {
        createGame(ruleSet: $ruleSet) {
            id
            ruleset 
            cards {
                classification 
                id
                owner 
                lastSelectedBy
                word
                gameId
            }
        }
    }
`

export const updateCard = gql`
    mutation updateCard($cardInput: CardInput!) {
        updateCard(cardInput: $cardInput) {
            id
            ruleset
            cards {
                classification
                id
                owner
                lastSelectedBy
                word
                gameId
            }
        }
    }
`

export const deleteGame = gql`
    mutation deleteGame($id: ID!) {
        deleteGame(id: $id)
    }
`
