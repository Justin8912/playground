export type Team = "Blue" | "Red" | "Green1" | "Green2";

export type Card = {
  classification: string
  id: string
  owner: Team
  word: string
  lastSelectedBy: Team
}