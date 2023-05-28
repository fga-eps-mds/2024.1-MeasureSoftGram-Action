import * as core from '@actions/core';
import * as github from '@actions/github';

import Sonarqube from './sonarqube'

async function run() {
  try {
    const { repo } = github.context
    const sonarqube = new Sonarqube(repo)
    const currentDate = new Date();

    const measures = await sonarqube.getMeasures({
      pageSize: 500,
    })

    console.log('Measures: ', measures);

    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear().toString().padStart(4, '0')}-${currentDate.getHours().toString().padStart(2, '0')}-${currentDate.getMinutes().toString().padStart(2, '0')}`;
    const file_path = `./analytics-raw-data/fga-eps-mds-${repo.repo}-${formattedDate}.json`;

    console.log(`Writing file to ${file_path}`);

    // `who-to-greet` input defined in action metadata file
    const nameToGreet = core.getInput('who-to-greet');
    const sonarQubeHost = core.getInput('host');
    console.log(`sonarQubeHost: ${sonarQubeHost}`);
    console.log(`Hello ${nameToGreet}!`);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();