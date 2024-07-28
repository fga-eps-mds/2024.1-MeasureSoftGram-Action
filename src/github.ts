import axios, { AxiosInstance } from 'axios';
import { GitHubInfo } from './utils';
import { Info } from './utils';

export interface GithubMetricsResponse {
  metrics: Array<{
    name: string
    value: number | string | null
    path?: string
  }>
}
export default class GitHubMeasure {
  private http: AxiosInstance
  public host: string
  private token: string
  public repository: string
  public owner: string
  public label: string | null
  public githubMetrics = [
      'closed_issues',
      'total_issues'
  ]

  constructor(info: GitHubInfo) {
    this.host ='https://api.github.com/'
    this.token = info.token
    this.owner = info.owner
    this.label = info.label
    this.repository = info.repo

    const tokenb64 = Buffer.from(`${this.token}:`).toString('base64')

    console.log(`Github repository: ${this.repository}`)
    console.log(`Github: ${this.owner}`)

    this.http = axios.create({
        baseURL: this.host,
        timeout: 10000,
        headers: {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Authorization": this.token ? `Bearer ${this.token}` : ""
        }
    })
  }
  private async getThroughput(
    baseUrl: string, 
    token: string, 
    label: string | null, 
    beginDate: string
  ): Promise<{
    name: string, 
    value: number
  }[] | null>{
    let github_url = (state: string) : string => {
      return `${baseUrl}/issues?state=${state}&labels=${label}`
    }
    try {
      
      const closed_response = await this.http.get(github_url("closed"));
      const total_response= await this.http.get(github_url("all")); 
      console.log(`github URL: ${github_url}`)
  
      if (closed_response.status !== 200 || !closed_response.data || total_response.status !== 200 || !total_response.data) {
        throw new Error(
          'Error getting project measures from Github. Please make sure you provided and token inputs.'
        )
      }
  
      const total_issues = total_response.data.length(); 
      const closed_issues = closed_response.data.length(); 

      return [{name: "total_issues", value: total_issues}, {name: "closed_issues", value: closed_issues}]

    } catch (err) {
      throw new Error(
        'Error getting project measures from GitHub. Please make sure you provided the host and token inputs.'
      )
  }
}
  public fetchGithubMetrics = async (beginDate: string, workflowName: string) : Promise<GithubMetricsResponse> => {
    const response: GithubMetricsResponse = {
      metrics: []
    }
    const baseUrl = `https://api.github.com/repos/${this.owner}/${this.repository}`
    const throughtput = await this.getThroughput(baseUrl, this.token, this.label, beginDate); 

    if(throughtput){
      throughtput.forEach(githubmetric => response.metrics.push({
        name: githubmetric.name,
        value: githubmetric.value 
    })

      )
    }
  }
}