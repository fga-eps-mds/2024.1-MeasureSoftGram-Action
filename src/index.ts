import * as core from '@actions/core';
import * as github from '@actions/github';
import { exec } from '@actions/exec';
import fs from 'fs';

import { getInfo, Info } from './utils';
import Sonarqube from './sonarqube'

export interface CalculatedMsgram {
  repository: { key: string; value: string }[];
  version: { key: string; value: string }[];
  measures: { key: string; value: number }[];
  subcharacteristics: { key: string; value: number }[];
  characteristics: { key: string; value: number }[];
  sqc: { key: string; value: number }[];
}

async function run() {
  try {
    const { repo } = github.context
    const info:Info = getInfo(repo)
    const sonarqube = new Sonarqube(info)
    const currentDate = new Date();

    const measures = await sonarqube.getMeasures({
      pageSize: 500,
    })

    const file_path = generateFilePath(currentDate, repo.repo);

    createFolder('./analytics-raw-data');
    console.log(`Writing file to ${file_path}`);

    fs.writeFile(file_path, JSON.stringify(measures), (err: any) => {
      if (err) throw err;
      console.log('Data written to file.');
    });

    await exec('pip', ['install', 'msgram==1.0.2'])
    await exec('msgram', ['init']);

    // overwrite the existing msgram.json file with the new one
    const msgramConfigPath = core.getInput('msgramConfigPath', {required: true});
    fs.copyFileSync(msgramConfigPath, './.msgram/msgram.json');

    const data2 = fs.readFileSync('./.msgram/msgram.json', 'utf8');
    console.log("msgram.json file data: ", data2);

    await exec('msgram', ['extract', '-o', 'sonarqube', '-dp', './analytics-raw-data/', '-ep', '.msgram', '-le', 'py']);
    await exec('msgram', ['calculate', 'all', '-ep', '.msgram', '-cp', '.msgram/', '-o', 'json']);


    const data = fs.readFileSync('.msgram/calc_msgram.json', 'utf8');
    console.log(data);

    const result: Array<CalculatedMsgram> = JSON.parse(data);

    const octokit = github.getOctokit(
      core.getInput('githubToken', {required: true})
    );
    const { pull_request } = github.context.payload;

    if (!pull_request) {
      console.log('No pull request found.');
      return;
    }

    const message = createMessage(result);

    await octokit.rest.issues.createComment({
      ...github.context.repo,
      issue_number: pull_request.number,
      body: message
    });
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

export function createFolder(folderPath: string) {
  fs.mkdir(folderPath, { recursive: true }, (err: any) => {
    if (err) {
      console.error(`Error creating folder: ${err}`);
      return;
    }
    console.log('Folder created successfully.');
  });
}

export function generateFilePath(currentDate: Date, repo: string) {
  const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear().toString().padStart(4, '0')}-${currentDate.getHours().toString().padStart(2, '0')}-${currentDate.getMinutes().toString().padStart(2, '0')}`;
  const file_path = `./analytics-raw-data/fga-eps-mds-${repo}-${formattedDate}.json`;

  return file_path;
}

// function to create a message with the results
export function createMessage(result: Array<CalculatedMsgram>) {
  const message = `
    ## Sonarqube Analysis Results

    ### SQC Values

    ${result[0].sqc[0].value}

    ### Characteristics Values

    ${result[0].characteristics.map((characteristic) => `* **${characteristic.key}**: ${characteristic.value}`).join('\n')}

    ###`.trim().replace(/^\s+/gm, '');

  return message;
}

run();