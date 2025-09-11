import fs from "fs";
import { TvService } from "./tmdb/api.js";
import inquirer from "inquirer";
import dotenv from 'dotenv';

dotenv.config();

const tvDirectoryPath = process.env.base_tvshow_path

const sanitizeFilename = (title) => {
    let newStr = title.replace(/[:\/\\*]/g, '-');
    newStr = newStr.replace(/\?/g, '');
    return newStr;
} 

const main = async (tvShow, dryRun) => {
    const baseTvShowPath = tvDirectoryPath + tvShow
    const seasons = fs.readdirSync(baseTvShowPath);
    const tvService = new TvService(process.env.tvService_accessKey);
    const tvShowName = tvShow.split("(")[0].trim()
    const tvShowPremierYear = tvShow.split("(")[1].split(")")[0].trim();
    await tvService.setTvSeries(tvShowName, tvShowPremierYear);

    for (const season of seasons) {
        const seasonPath = `${baseTvShowPath}\\${season}`
        if (!(fs.statSync(seasonPath)).isDirectory()) {
            console.log(`${JSON.stringify(season)} is not a directory. Skipping`);
            continue;
        }
        const episodes = fs.readdirSync(seasonPath);
        const episodeNames = await tvService.getTvSeasonEpisodes(season.split(" ")[1])
        for (const episode of episodes) {
            const seFormatPattern = /s\d{2}e\d{2}/;
            const eFormatPattern = /e\d{2}/;
            let seFormat;
            try {
                seFormat = (episode.toLowerCase().match(seFormatPattern)).toString();
            } catch (err) {
                console.log(`There was an error trying to use the Season/Epsiode format for episode: ${episode}. Switching to Episode format.`);
                const eFormat = (episode.toLowerCase().match(eFormatPattern)).toString();
                seFormat = `s01${eFormat}`
            }

            const episodeNumberPattern = /(?<=e)\d{2}/
            const episodeNumber = parseInt((seFormat.match(episodeNumberPattern)).toString());

            const fileExtensionPattern = /(?<=\.)[^.]+$/
            const fileExtension = (episode.match(fileExtensionPattern)).toString();

            const newTitle = `${tvShowName} - ${seFormat} - ${episodeNames[episodeNumber-1]}.${fileExtension}`
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

// const asd = async () => {
//     const tvService = new TvService(process.env.tvService_accessKey);
//     // tvService.tvShowId="31911"
//     await tvService.setTvSeries("Fullmetal Alchemist Brotherhood", 2009)
//     const res = await tvService.getTvSeasonEpisodes(1)
//     console.log(res)
// }


// asd()