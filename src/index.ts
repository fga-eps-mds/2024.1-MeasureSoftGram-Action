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