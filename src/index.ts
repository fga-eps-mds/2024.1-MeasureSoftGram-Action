import * as core from '@actions/core';
import * as github from '@actions/github';

import { getInfo, Info } from './utils';
import Sonarqube from './sonarqube'
import { RequestService } from './service/request-service';
import Service from './service/service';

export interface CalculatedMsgram {
  repository: { key: string; value: string }[];
  version: { key: string; value: string }[];
  measures: { key: string; value: number }[];
  subcharacteristics: { key: string; value: number }[];
  characteristics: { key: string; value: number }[];
  sqc: { key: string; value: number }[];
}

export async function run() {
  try {
    console.log('Starting action with Service');
    const { repo } = github.context;
    const info:Info = getInfo(repo);
    const sonarqube = new Sonarqube(info);
    const productName = core.getInput('productName');
    const requestService = new RequestService();
    requestService.setMsgToken(core.getInput('msgramServiceToken'));

    const metrics = await sonarqube.getMeasures({
      pageSize: 500,
    })

    const service = new Service(repo.repo, repo.owner, requestService, productName, metrics)
    const result = await service.run()

    // const result: Array<CalculatedMsgram> = JSON.parse(data);

    const octokit = github.getOctokit(
      core.getInput('githubToken', {required: true})
    );
    const { pull_request } = github.context.payload;

    if (!pull_request) {
      console.log('No pull request found.');
      return;
    }

    const message = createMessage(result);

    await createOrUpdateComment(pull_request.number, message, octokit);

  
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('Unknown error');
    }
  }
}


// function to create a message with the results
export function createMessage(result: Array<CalculatedMsgram>) {
  const message = `
    ## MeasureSoftGram Analysis Results

    ### SQC Values

    ${result[0].sqc[0].value.toFixed(2)}

    ### Characteristics Values

    ${result[0].characteristics.map((characteristic) => `* **${characteristic.key}**: ${characteristic.value.toFixed(2)}`).join('\n')}

    ###`.trim().replace(/^\s+/gm, '');

  return message;
}

export async function createOrUpdateComment(pullRequestNumber: number, message: string, octokit: any) {
  // Check if a comment already exists on the pull request
  const { data: comments } = await octokit.rest.issues.listComments({
    ...github.context.repo,
    issue_number: pullRequestNumber
  });
  const actionUser = "github-actions[bot]"

  const existingComment = comments.find(
    (comment: any) => {
      return comment.user.login === actionUser && comment.body.includes('## MeasureSoftGram Analysis Results');
    }
  );

  if (existingComment) {
    // Comment already exists, update it
    await octokit.rest.issues.updateComment({
      ...github.context.repo,
      comment_id: existingComment.id,
      body: message
    });
  } else {
    // Comment doesn't exist, create a new comment
    await octokit.rest.issues.createComment({
      ...github.context.repo,
      issue_number: pullRequestNumber,
      body: message
    });
  }
}

run();