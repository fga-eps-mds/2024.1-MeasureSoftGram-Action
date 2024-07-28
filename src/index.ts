import * as core from '@actions/core'
import * as github from '@actions/github'

import { getInfo, Info } from './utils'
import Sonarqube, { MetricsResponseAPI } from './sonarqube'
import { RequestService } from './service/request-service'
import Service from './service/service'
import GithubComment from './github/github-comment'
import GithubAPIService, { GithubMetricsResponse } from './github'

export async function run() {
  try {
    console.log(github.context?.payload?.pull_request)
    console.log(github.context?.payload?.pull_request?.merged)

    // if (!github.context.payload.pull_request) return
    // if (!github.context.payload.pull_request.merged) return

    console.log('Starting action with Service')
    const { repo } = github.context
    const githubToken = core.getInput('githubToken', { required: true })
    const workflowName = core.getInput('workflowName')
    const collectSonarqubeMetrics = core.getInput('collectSonarqubeMetrics') === 'true' ? true : false
    const collectGithubMetrics = !!core.getInput('collectGithubMetrics') ? true : false
    const currentDate = new Date()
    const info: Info = getInfo(repo)
    const sonarqube = new Sonarqube(info)
    const githubApiService = new GithubAPIService(githubToken)
    const productName = core.getInput('productName')
    const requestService = new RequestService()
    requestService.setMsgToken(core.getInput('msgramServiceToken'))

    console.log({
      workflowName,
      collectSonarqubeMetrics,
      collectGithubMetrics,
      info,
      productName,
    })

    const octokit = github.getOctokit(githubToken)
    const { pull_request } = github.context.payload

    let metrics: MetricsResponseAPI | null = null

    if (collectSonarqubeMetrics) {
      metrics = await sonarqube.getMeasures({
        pageSize: 500,
        pullRequestNumber: null,
      })
    }

    console.log('test new action version')

    let githubMetrics: GithubMetricsResponse | null = null

    if (collectGithubMetrics) {
      githubMetrics = await githubApiService.fetchGithubMetrics(workflowName)
    }

    const service = new Service(repo.repo, repo.owner, productName, metrics, currentDate, githubMetrics)
    const result = await service.calculateResults(requestService)

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
