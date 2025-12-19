// Queries
export const getGameById = /* GraphQL */ `
    query getGame($id: ID!) {
        getGame(gameId: $id) {
            PartitionKey
            Ruleset
            cards {
                Classification
                GameId
                LastSelectedBy
                Owner
                PartitionKey
                Word
            }
        }
    }
`;

export const getAllGames = /* GraphQL */`
    query getAllGames {
        getAllGames {
            PartitionKey
            Ruleset
        }
    }
`;

// Mutations
export const createGame = /* GraphQL */ `
    mutation createGame($ruleSet: Ruleset!) {
        createGame(ruleset: $ruleSet) {
            gameId
            status
        }
    }
`;

export const updateCard = /* GraphQL */ `
    mutation updateCard($cardInput: CardInput!) {
        updateCard(cardInput: $cardInput)
    }
`;

export const deleteGame = /* GraphQL */ `
    mutation deleteGame($id: ID!) {
        deleteGame(gameId: $id) {
            status
            message
        }
    }
`;

