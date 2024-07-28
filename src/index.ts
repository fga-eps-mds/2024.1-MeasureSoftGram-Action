import * as core from '@actions/core';
import * as github from '@actions/github';

import { getGitHubInfo, getInfo, Info } from './utils';
import Sonarqube from './sonarqube'
import { RequestService } from './service/request-service';
import Service from './service/service';
import GithubComment from './github/github-comment';
import GitHubMeasure from './github';

export async function run() {
  try {
    console.log("Iniciando coleta de medidas")
    if (!github.context.payload.pull_request) return;
    if (!github.context.payload.pull_request.merged) return;

    console.log('Starting action with Service');
    const { repo } = github.context;
    const currentDate = new Date();
    const info:Info = getInfo(repo);
    const githubToken = core.getInput('githubToken', {required: true});
    const productName = core.getInput('productName');
    const service = new Service(repo.repo, repo.owner, productName, currentDate);
    const requestService = new RequestService();
    requestService.setMsgToken(core.getInput('msgramServiceToken'));
    const begin_date = await service.checkReleaseExists(requestService); 
    const githubInfo = getGitHubInfo(repo, begin_date)
    const githubMeasure = new GitHubMeasure(githubInfo); 
    const sonarqube = new Sonarqube(info);
    
    const octokit = github.getOctokit(githubToken);
    const { pull_request } = github.context.payload;
    
    const metrics = await sonarqube.getMeasures({
      pageSize: 500,
      pullRequestNumber: null,
    })

    const githubMetrics = await githubMeasure.getMeasures(); 

    const result = await service.calculateResults(requestService, metrics)

    if (!pull_request) {
      console.log('No pull request found.');
      return;
    }

    console.log('Creating comment');
    const githubComment = new GithubComment();
    const message = githubComment.createMessage(result);
    
    await githubComment.createOrUpdateComment(pull_request.number, message, octokit);
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('Unknown error');
    }
  }
}

run();