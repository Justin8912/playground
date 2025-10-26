Designing backend types
==
GameInfo: {
    cards: Card[][]
    Ruleset: "Duos" | "Multiplayer" 
    ID: ID!
}

Card: {
  word: string 
  owner: Team
  classification: Classification
  teamLastSelected: Team | "none", 
}

Owner(Team) {

}

Team: "Blue" | "Red" | "Green1" | "Green2"
Classification: "green" | "black"

Graphql design 

type Game {
  id: ID!
  ruleset: Ruleset!
  cards: [[Card!]!]!
}

type Card {
  word: String!
  owner: Team!
  classification: Classification!
  teamLastSelected: Team
}

type OwnerInfo {
  greenCards: [Card!]!
  blackCards: [Card!]!
}

Query {
    ownerInfo(team: Team!): OwnerInfo!
}

enum Team {
  Blue
  Red
  Green1
  Green2
}

enum Classification {
  green
  black
}

enum Ruleset {
  Duos
  Multiplayer
}
