import * as core from '@actions/core';
import * as github from '@actions/github';
import { exec } from '@actions/exec';
import fs from 'fs';

import Sonarqube from './sonarqube'

async function run() {
  try {
    const { repo } = github.context
    const sonarqube = new Sonarqube(repo)
    const currentDate = new Date();

    const measures = await sonarqube.getMeasures({
      pageSize: 500,
    })

    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear().toString().padStart(4, '0')}-${currentDate.getHours().toString().padStart(2, '0')}-${currentDate.getMinutes().toString().padStart(2, '0')}`;
    const file_path = `./analytics-raw-data/fga-eps-mds-${repo.repo}-${formattedDate}.json`;

    createFolder('./analytics-raw-data');
    console.log(`Writing file to ${file_path}`);

    fs.writeFile(file_path, JSON.stringify(measures), (err) => {
      if (err) throw err;
      console.log('Data written to file.');
    });

    await exec('pip', ['install', 'msgram==1.1.0'])
    await exec('msgram', ['init']);
    await exec('msgram', ['extract', '-o', 'sonarqube', '-dp', './analytics-raw-data/', '-ep', '.', '-le', 'py']);
    await exec('msgram', ['calculate', '-ep', '.', '-cp', '.msgram/', '-o', 'json']);

    const data = fs.readFileSync('.msgram/calc_msgram.json', 'utf8');
    console.log(data);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

function createFolder(folderPath: string) {
  fs.mkdir(folderPath, { recursive: true }, (err) => {
    if (err) {
      console.error(`Error creating folder: ${err}`);
      return;
    }
    console.log('Folder created successfully.');
  });
}

run();