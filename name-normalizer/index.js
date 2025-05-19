import fs from "fs";
import { TvService } from "./tmdb/api.js";
import inquirer from "inquirer";
import dotenv from 'dotenv';

dotenv.config();

const tvDirectoryPath = process.env.base_tvshow_path

const sanitizeFilename = (title) => {
    let newStr = title.replace(/[:\/\\]/g, '-');
    newStr = newStr.replace(/\?/g, '')
    return newStr;
} 

const main = async (tvShow, year, dryRun) => {
    const baseTvShowPath = tvDirectoryPath + tvShow
    const seasons = fs.readdirSync(baseTvShowPath);
    const tvService = new TvService(process.env.tvService_accessKey);
    await tvService.setTvSeries(tvShow.split("(")[0].trim(), year);

    for (const season of seasons) {
        const seasonPath = `${baseTvShowPath}\\${season}`
        const episodes = fs.readdirSync(seasonPath);
        const episodeNames = await tvService.getTvSeasonEpisodes(season.split(" ")[1])
        for (const episode of episodes) {
            const seFormatPattern = /s\d{2}e\d{2}/;
            const seFormat = (episode.toLowerCase().match(seFormatPattern)).toString();

            const episodeNumberPattern = /(?<=e)\d{2}/
            const episodeNumber = parseInt((seFormat.match(episodeNumberPattern)).toString());

            const fileExtensionPattern = /(?<=\.)[^.]+$/
            const fileExtension = (episode.match(fileExtensionPattern)).toString();

            const newTitle = `${tvShow} - ${seFormat} - ${episodeNames[episodeNumber-1]}.${fileExtension}`
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

const questions = [
    {
        type: 'list',
        name: 'tvShow',
        message: 'Choose a tv show whose names you\'d like to format:',
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

inquirer.prompt(questions).then((answers) => {
    console.log('You selected: ', answers);
    main(answers.tvShow, answers.year, answers.dryRun)
});
