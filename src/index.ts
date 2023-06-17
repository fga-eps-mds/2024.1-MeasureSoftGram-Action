import * as core from '@actions/core';
import * as github from '@actions/github';
import { exec } from '@actions/exec';
import fs from 'fs';

import { getInfo, Info } from './utils';
import Sonarqube from './sonarqube'
import { SaveService } from './save_service';

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
    const { repo } = github.context
    const info:Info = getInfo(repo)
    const sonarqube = new Sonarqube(info)
    const currentDate = new Date();
    // service test
    const service = new SaveService();

    const metrics = await sonarqube.getMeasures({
      pageSize: 500,
    })

    const file_path = generateFilePath(currentDate, repo.repo);

    // ------------------------------------ NEW SERVICE STUFF ------------------------------------ 
    // log repo info
    console.log(`Repo: ${repo.repo}`);
    console.log(`Owner: ${repo.owner}`);
    
    // set Endpoint environment variables
    service.setMsgramServiceHost('https://measuresoft.herokuapp.com');
    const msgramServiceToken = core.getInput('msgramServiceToken');  // get the renamed secret
    service.setMsgToken(msgramServiceToken);

    //log base url and token
    console.log(`Base URL: ${service.getBaseUrl()}`);
    console.log(`Token: ${service.getMsgToken()}`);
    
    // get organization name
    const inputOrganization = repo.owner;
    console.log(`Organization: ${inputOrganization}`);

    // get from service the list of organizations and check if the organization exists
    const response = await service.listOrganizations();
    const organizations = response.results;

    let orgId = null;
    let organizationExists = false;

    for (const org of organizations) {
      if (org.name === inputOrganization) {
        organizationExists = true;
        orgId = org.id;
        break;
      }
    }

    if (!organizationExists) {
      throw new Error(`Organization ${inputOrganization} does not exist.`);
    }
    else {
      console.log(`Organization ${inputOrganization} exists with id ${orgId}.`);
    }

      // get from service the list of products and check if the project exists
    const responseProducts = await service.listProducts(orgId);
    const products = responseProducts.results;

    let productId = null;
    let productExists = false;
    const productName = 'MeasureSoftGram'

    for (const product of products) {
      if (product.name === productName) {
        productExists = true;
        productId = product.id;
        break;
      }
    }

    if (!productExists) {
      throw new Error(`Product ${productName} does not exist.`);
    }
    else {
      console.log(`Product ${productName} exists with id ${productId}.`);
    }

    // get from service the list of repositories and check if the repository exists
    const responseRepositories = await service.listRepositories(orgId, productId);
    const repositories = responseRepositories.results;

    let repositoryId = null;
    let repositoryExists = false;

    for (const repository of repositories) {
      // if (repository.name === repo.repo) {
      if (repository.name === '2023-1-MeasureSoftGram-Service') {
        repositoryExists = true;
        repositoryId = repository.id;
        break;
      }
    }

    if (!repositoryExists) {
      // throw new Error(`Repository ${repo.repo} does not exist.`);
      throw new Error(`Repository 2023-1-MeasureSoftGram-Service does not exist.`);
    }
    else {
      // console.log(`Repository ${repo.repo} exists with id ${repositoryId}.`);
      console.log(`Repository 2023-1-MeasureSoftGram-Service exists with id ${repositoryId}.`);
    }

    // check if a release is already created for the current date if not throw an error and end the action
    const responseReleases = await service.listReleases(orgId, productId);
    // console.log('index: ', responseReleases);
    if (!responseReleases) {
      throw new Error('No releases found');
    }    
    // convert the current date to ISO string and remove the time

    // const currentDateStr = currentDate.toISOString().split('T')[0];
    const currentDateStr = '2023-06-06';

    let releaseId = null;
    let releaseExists = false;

    for (const release of responseReleases) {
      // remove the time from the start and end dates
      const startAt = release.start_at.split('T')[0];
      const endAt = release.end_at.split('T')[0];
    
      // check if the current date is between the start and end dates
      if (currentDateStr >= startAt && currentDateStr <= endAt) {
        releaseExists = true;
        releaseId = release.id;
        break;
      }
    }

    if (!releaseExists) {
      throw new Error(`No release is happening on ${currentDateStr}.`);
    } else {
      console.log(`Release with id ${releaseId} is happening on ${currentDateStr}.`);
    }

    // ------------------------------------ END OF NEW SERVICE STUFF ------------------------------------

    console.log('Creating folder for raw data');
    // create folder if it doesn't exist
    createFolder('./analytics-raw-data');
    console.log(`Writing file to ${file_path}`);
    const string_metrics = JSON.stringify(metrics);

    fs.writeFile(file_path, string_metrics, (err: any) => {
      if (err) throw err;
      console.log('Data written to file.');
    });

    console.log('Calculating metrics, measures, characteristics and subcharacteristics');
    // ------------------------------------ NEW SERVICE STUFF ------------------------------------
    // get the msgram.json file and send it to the service
    await service.createMetrics(string_metrics, orgId, productId, repositoryId);
    const response_measures = await service.calculateMeasures(orgId, productId, repositoryId);
    const data_measures = response_measures.data;
    // log data measures as calculated measures with a enter
    console.log('Calculated measures: \n', data_measures);
    const response_char = await service.calculateCharacteristics(orgId, productId, repositoryId);
    const data_char = response_char.data;
    // lof data char as calculated characteristics with a enter
    console.log('Calculated characteristics: \n', data_char);
    const response_subchar = await service.calculateSubCharacteristics(orgId, productId, repositoryId);
    const data_subchar = response_subchar.data;
    // log data subchar as calculated subcharacteristics with a enter
    console.log('Calculated subcharacteristics: \n', data_subchar);
    const response_sqc = await service.calculateSQC(orgId, productId, repositoryId);
    console.log('SQC: \n', response_sqc);
    const data_sqc = response_sqc.data;
    // ------------------------------------ END OF NEW SERVICE STUFF ------------------------------------

    // Parse the characteristics response
    const characteristics = data_char.map((char: { key: any; latest: { value: any; }; }) => {
      return {
        key: char.key,
        value: char.latest.value
      }
    });

    // Parse the SQC response
    const sqc = [{
      key: 'sqc',
      value: data_sqc.value
    }];

    const result: Array<CalculatedMsgram> = [{
      repository: [],
      version: [],
      measures: [],
      subcharacteristics: [],
      characteristics: characteristics,
      sqc: sqc
    }];
  
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

// RUN
run();