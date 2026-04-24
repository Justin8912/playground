import inquirer from "inquirer";
import {getBaseDirectoryPath, HOME_SERVER} from "./constants.js";
import fs from "fs";
import {exec} from "child_process";
import nodeDiskInfo from "node-disk-info";


const main = (selectedDisk, movie) => {
    const moviePath = getBaseDirectoryPath(selectedDisk) + movie;
    const scpCommand = `scp "${moviePath}" ${HOME_SERVER.user}@${HOME_SERVER.ip}:"${HOME_SERVER.directory}"`
    exec(scpCommand, (err, stdout, stderr) => {
        console.log("err:", err);
        console.log("out:", stdout);
        console.log("stderr:", stderr);
    })
    console.log(scpCommand)
}

let disks = nodeDiskInfo.getDiskInfoSync();
disks = disks.map(disk => disk.mounted[0])

const selectDiskDrive = [{
    type: 'list',
    name: 'diskDrive',
    message: 'Select the disk drive where your movies are stored:',
    choices: disks,
}]

const questions = (selectedDisk) => [
    {
        type: 'list',
        name: 'movie',
        message: 'Choose a movie you\'d like to transfer:',
        choices: fs.readdirSync(getBaseDirectoryPath(selectedDisk)),
    }
];

inquirer.prompt(selectDiskDrive).then((answers) => {
    const selectedDisk = answers.diskDrive;

    inquirer.prompt(questions(selectedDisk)).then((answers) => {
        main(selectedDisk, answers?.movie)
    });
})