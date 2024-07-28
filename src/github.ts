import axios, { AxiosResponse } from 'axios';
import { GitHubInfo } from './utils';

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
  public host: string
  private token: string
  public repository: string
  public owner: string
  public label: string | null
  beginDate: string

  constructor(info: GitHubInfo) {
    this.host ='https://api.github.com/'
    this.token = info.token
    this.owner = info.owner
    this.label = info.label
    this.repository = info.repo
    this.beginDate = info.beginDate

    const tokenb64 = Buffer.from(`${this.token}:`).toString('base64')

    console.log(`Github repository: ${this.repository}`)
    console.log(`Github: ${this.owner}`)

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

  private async getThroughput(
    baseUrl: string, 
    label: string | null, 
    beginDate: string
  ): Promise<{
    name: string, 
    value: number
  }[] | null>{
    //const githubClosedUrl = `${baseUrl}/issues?state=closed&labels=${label}&since=${beginDate}`
    //const githubAllUrl = `${baseUrl}/issues?state=all&labels=${label}&since=${beginDate}`; 
    let githubClosedUrl = `${baseUrl}/search/issues?q=repo:${this.owner}/${this.repository} is:issue state:closed updated:>${beginDate}`
    let githubAllUrl = `${baseUrl}/search/issues?q=repo:${this.owner}/${this.repository} is:issue updated:>${beginDate}`

    if(this.label){
      githubClosedUrl += ` label:${this.label}`
      githubAllUrl += ` label:${this.label}`
    } 

    const closed_response = await this.makeRequest<any>(githubClosedUrl, this.token);
    const total_response= await this.makeRequest<any>(githubAllUrl, this.token); 

    console.log(closed_response); 
    console.log(total_response);
    
    try {
      
      console.log(`github URL: ${githubClosedUrl}`)
  
      if (!closed_response || !total_response) {
        throw new Error(
          'Error getting project measures from Github. Please make sure you provided and token inputs.'
        )
      }
  
      const total_issues = total_response.total_count; 
      const closed_issues = closed_response.total_count; 

      return [{name: "total_issues", value: total_issues}, {name: "closed_issues", value: closed_issues}]

    } catch (err) {
      throw new Error(
        'Error getting project measures from GitHub. Please make sure you provided the host and token inputs.'
      )
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

  public fetchGithubMetrics = async (workflowName: string) : Promise<GithubMetricsResponse> => {
    const response: GithubMetricsResponse = {
      metrics: []
    }
    const baseUrl = `https://api.github.com`
    const urlCi = `${baseUrl}/repos/${this.owner}/${this.repository}`
    const throughtput = await this.getThroughput(baseUrl, this.label, this.beginDate); 

    const ciFeedbackTime = await this.getCIFeedbackTime(urlCi, this.token, workflowName)

    if (ciFeedbackTime) {
      response.metrics.push({
        name: ciFeedbackTime.metric,
        value: ciFeedbackTime.value,
        path: `${this.owner}/${this.repository}`,
      })
    }

    if(throughtput){
      throughtput.forEach(githubmetric => response.metrics.push({
        name: githubmetric.name,
        value: githubmetric.value, 
        path: `${this.owner}/${this.repository}`,
      }))
    }
    return response; 
  }
}
