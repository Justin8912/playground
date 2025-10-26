export type Team = "Blue" | "Red";
export type CardState = "untouched" | "bystander" | "success";

export type Card = {
  word: string 
  owner: Team
  teamLastSelected: Team | "none", 
  state: string
}