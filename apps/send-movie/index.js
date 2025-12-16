import inquirer from "inquirer";
import {BASE_MOVIE_DIRECTORY_PATH, HOME_SERVER} from "./constants.js";
import fs from "fs";
import {exec} from "child_process";


const main = (movie) => {
    const moviePath = BASE_MOVIE_DIRECTORY_PATH + movie;
    const scpCommand = `scp "${moviePath}" ${HOME_SERVER.user}@${HOME_SERVER.ip}:"${HOME_SERVER.directory}"`
    exec(scpCommand, (err, stdout, stderr) => {
        console.log("err:", err);
        console.log("out:", stdout);
        console.log("stderr:", stderr);
    })
    console.log(scpCommand)
}

const questions = [
    {
        type: 'list',
        name: 'movie',
        message: 'Choose a movie you\'d like to transfer:',
        choices: fs.readdirSync(BASE_MOVIE_DIRECTORY_PATH),
    }
];

inquirer.prompt(questions).then((answers) => {
    console.log('You selected: ', answers);
    main(answers.movie)
});