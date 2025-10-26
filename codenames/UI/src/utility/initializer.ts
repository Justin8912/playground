import { type Card, type Team } from "../types";

const WORDS = [
  "wonderland","yellowstone","castle","diamond","eagle"
];

const shuffle = <T>(array: T[]): T[] => {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const generateCard = (word = "", owner: Team = "Team1"): Card => {
  return {
    word,
    owner,
    teamLastSelected: "none",
    state: "untouched"
  };
};

export const initializeCardArray = (): Card[][] => {
  const shuffled = shuffle(WORDS);
  const cards: Card[][] = [];

  for (let row = 0; row < 5; row++) {
    const currentRow: Card[] = [];
    for (let col = 0; col < 5; col++) {
      const idx = row * 5 + col;
      const word = shuffled[idx] ?? `Card ${idx + 1}`;
      currentRow.push(generateCard(word));
    }
    cards.push(currentRow);
  }

  return cards;
};