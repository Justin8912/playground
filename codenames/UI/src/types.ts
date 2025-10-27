export type Team = "Blue" | "Red";
export type CardState = "untouched" | "bystander" | "success";

export type Card = {
  classification: string
  id: string
  owner: Team
  word: string
}