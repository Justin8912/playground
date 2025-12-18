const WORDS = [
  "wonderland","yellowstone","castle","diamond","eagle"
];

const shuffle = (array) => {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const generateCard = (word = "", owner = "Blue") => {
  return {
    word,
    owner,
    lastSelectedBy: "None"
  };
};

export const initializeCardArray = () => {
  const shuffled = shuffle(WORDS);
  const cards = [];

  for (let row = 0; row < 5; row++) {
    const currentRow = [];
    for (let col = 0; col < 5; col++) {
      const idx = row * 5 + col;
      const word = shuffled[idx] ?? `Card ${idx + 1}`;
      currentRow.push(generateCard(word));
    }
    cards.push(currentRow);
  }

  return cards;
};