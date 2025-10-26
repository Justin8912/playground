export type Team = "Team1" | "Team2";
export type CardState = "untouched" | "bystander" | "success";

export type Card = {
  word: string 
  owner: Team
  teamLastSelected: Team | "none", 
  state: string
}