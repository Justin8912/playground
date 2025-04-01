import fs from "fs";
import { TvService } from "./tmdb/api.js";
import inquirer from "inquirer";
import dotenv from 'dotenv';

dotenv.config();

const tvDirectoryPath = "C:\\Users\\jnste\\OneDrive\\Pictures\\tv\\"
const main = async (tvShow, year, dryRun) => {
    const baseTvShowPath = tvDirectoryPath + tvShow
    const seasons = fs.readdirSync(tvDirectoryPath+tvShow);
    const tvService = new TvService(process.env.tvService_apiKey);
    const tvShowId = await tvService.getTvSeriesId(tvShow, year);
    for (const season of seasons) {
        const seasonPath = `${baseTvShowPath}\\${season}`
        const episodes = fs.readdirSync(seasonPath);
        const episodeNames = await tvService.getTvSeasonEpisodes(tvShowId, season.split(" ")[1])
        for (const episode of episodes) {
            const seFormatPattern = /s\d{2}e\d{2}/;
            const seFormat = (episode.toLowerCase().match(seFormatPattern)).toString();

            const episodeNumberPattern = /(?<=e)\d{2}/
            const episodeNumber = parseInt((seFormat.match(episodeNumberPattern)).toString());

            const fileExtensionPattern = /(?<=\.)[^.]+$/
            const fileExtension = (episode.match(fileExtensionPattern)).toString();

            const newTitle = `${tvShow} - ${seFormat} - ${episodeNames[episodeNumber-1]}.${fileExtension}`
            const sanitizeFilename = (newTitle) => newTitle.replace(/[:\/\\]/g, '-'); // Replace problematic characters
            const sanitizedNewTitle = sanitizeFilename(newTitle);

            if (episode !== sanitizedNewTitle) {
                if (dryRun) {
                    console.log(`${episode} => ${sanitizedNewTitle}`)
                } else {
                    fs.renameSync(`${seasonPath}\\${episode}`, `${seasonPath}\\${sanitizedNewTitle}`)
                }
            }
        }
    }
}

// Define the menu options
const questions = [
    {
        type: 'list', // Creates a selector menu
        name: 'tvShow',
        message: 'Choose a tv show whose names you\d like to format:',
        choices: fs.readdirSync(tvDirectoryPath),
    },
    {
        type: 'number',
        name: 'year',
        message: 'The year that the tv show first premiered'
    },
    {
        type: 'confirm',
        name: 'dryRun',
        message: 'Would you like to run as a dry run?',
        default: false 
    }
];

// Prompt the user
inquirer.prompt(questions).then((answers) => {
    console.log('You selected: ', answers);
    main(answers.tvShow, answers.year, answers.dryRun)
});

// main("Shogun", 2024)