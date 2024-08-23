import * as core from '@actions/core'
import * as github from '@actions/github'

import GithubAPIService, { GithubMetricsResponse } from './github'
import { getGitHubInfo, getInfo, Info } from './utils';
import { RequestService } from './service/request-service';
import Sonarqube, { MetricsResponseAPI } from './sonarqube'
import Service from './service/service';
import GithubComment from './github/github-comment';

export async function run() {
  try {

    console.log("Iniciando coleta de medidas")
    //if (!github.context.payload.pull_request) return;
    //if (!github.context.payload.pull_request.merged) return;

    console.log('Starting action with Service');
    const { repo } = github.context;
    const currentDate = new Date();
    const info:Info = getInfo(repo);
    const githubToken = core.getInput('githubToken', {required: true});
    const productName = core.getInput('productName');
    const workflowName = core.getInput('workflowName')
    const collectSonarqubeMetrics = core.getInput('collectSonarqubeMetrics') === 'true' ? true : false
    const collectGithubMetrics = !core.getInput('collectGithubMetrics') ? true : false
    const service = new Service(repo.repo, repo.owner, productName, currentDate);
    const requestService = new RequestService();
    requestService.setMsgToken(core.getInput('msgramServiceToken'));
    const releaseData = await service.checkReleaseExists(requestService); 
    const githubInfo = getGitHubInfo(repo, releaseData.startAt)
    const githubApiService = new GithubAPIService(githubInfo); 
    const sonarqube = new Sonarqube(info);
    
    const octokit = github.getOctokit(githubToken);
    const { pull_request } = github.context.payload;
    
    let metrics: MetricsResponseAPI | null = null
    
    if (collectSonarqubeMetrics) {
      metrics = await sonarqube.getMeasures({
        pageSize: 500,
        pullRequestNumber: null,
      })
    }
    
    
    let githubMetrics: GithubMetricsResponse | null = null
    
    if (collectGithubMetrics) {
      githubMetrics = await githubApiService.fetchGithubMetrics(workflowName)
    }
    
    //const service = new Service(repo.repo, repo.owner, productName, metrics, currentDate, githubMetrics)
    const result = await service.calculateResults(requestService, metrics, githubMetrics, releaseData.orgId, releaseData.productId, releaseData.repositoryId)
    // const githubMetrics = await githubMeasure.fetchGithubMetrics(); 

    // const result = await service.calculateResults(requestService, metrics, releaseData.orgId, releaseData.productId, releaseData.repositoryId)

    if (!pull_request) {
      console.log('No pull request found.')
      return
    }

    console.log('Creating comment')
    const githubComment = new GithubComment()
    const message = githubComment.createMessage(result)

    await githubComment.createOrUpdateComment(pull_request.number, message, octokit)
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('Unknown error')
    }
  }
}

run()
