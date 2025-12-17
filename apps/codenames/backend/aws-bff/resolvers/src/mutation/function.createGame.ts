import {Context} from "@aws-appsync/utils";

const WORDS = [
    "wonderland","yellowstone","castle","diamond","eagle"
];

const shuffle = (array: string[]) => {
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

const initializeCardArray = () => {
    // return shuffle(WORDS).map((word: string) => generateCard(word))
    const shuffledWords = shuffle(WORDS);

};

export function req (ctx: Context) {

}

export function res (ctx: Context) {

}