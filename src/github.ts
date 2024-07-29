import axios, { AxiosResponse } from 'axios'

export interface GithubMetricsResponse {
  metrics: Array<{
    name: string
    value: number | string | null
    path?: string
  }>
}

interface WorkflowRun {
  id: number
  name: string
  node_id: string
  head_branch: string
  head_sha: string
  path: string
  display_title: string
  run_number: number
  event: string
  status: string
  conclusion: string
  workflow_id: number
  check_suite_id: number
  check_suite_node_id: string
  url: string
  html_url: string
  pull_requests: Array<{
    url: string
    id: number
    number: number
  }>
  created_at: string
  updated_at: string
}

export default class GithubAPIService {
  private readonly token: string

  constructor(token: string) {
    this.token = token
  }

  private async makeRequest<T>(url: string, token: string | null = null): Promise<T | null> {
    const headers: { [key: string]: string } = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    try {
      const response: AxiosResponse = await axios.get<T>(url, { headers })
      return response.status === 200 ? response.data : {}
    } catch (e) {
      console.error('Error making request to Github API at URL:', url, e)
      return null
    }
  }

  private async getCIFeedbackTime(
    baseUrl: string,
    token: string | null = null,
    workflowName: string
  ): Promise<{
    metric: string
    value: number
  } | null> {
    const url = `${baseUrl}/actions/runs`
    const response = await this.makeRequest<{
      workflow_runs: Array<WorkflowRun>
    }>(url, token)

    if (response === null) {
      return null
    }

    const workflowRuns: Array<WorkflowRun> = response.workflow_runs ?? []

    const mostRecentWorkflowRun = workflowRuns.find(run => run.name === workflowName)

    if (!mostRecentWorkflowRun || mostRecentWorkflowRun.conclusion !== 'success') {
      return null
    }

    console.log(mostRecentWorkflowRun)

    const startedAt = new Date(mostRecentWorkflowRun.created_at).getTime()
    const completedAt = new Date(mostRecentWorkflowRun.updated_at).getTime()

    const feedbackTime = (completedAt - startedAt) / 1000

    return {
      metric: 'ci_feedback_time',
      value: feedbackTime,
    }
  }

  public async fetchGithubMetrics(workflowName: string): Promise<GithubMetricsResponse> {
    const repository = 'chfleury/golang-app'
    const response: GithubMetricsResponse = {
      metrics: [],
    }
    const values: (number | string | null)[] = []
    const [owner, repositoryName] = repository.split('/')
    const url = `https://api.github.com/repos/${owner}/${repositoryName}`

    const ciFeedbackTime = await this.getCIFeedbackTime(url, this.token, workflowName)

    if (ciFeedbackTime) {
      response.metrics.push({
        name: ciFeedbackTime.metric,
        value: ciFeedbackTime.value,
        path: repository,
      })
    }

    return response
  }
}
