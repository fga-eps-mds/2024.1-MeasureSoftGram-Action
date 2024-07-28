import axios, { AxiosInstance } from 'axios';
import { GitHubInfo } from './utils';
import { Info } from './utils';
import { GitHub } from '@actions/github/lib/utils';

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
    console.log(githubAllUrl);
    console.log(this.label)
    const closed_response = await this.http.get(githubClosedUrl);
    const total_response= await this.http.get(githubAllUrl); 

    console.log(closed_response); 
    console.log(total_response);
    
    try {
      
      console.log(`github URL: ${githubClosedUrl}`)
  
      if (closed_response.status !== 200 || !closed_response.data || total_response.status !== 200 || !total_response.data) {
        throw new Error(
          'Error getting project measures from Github. Please make sure you provided and token inputs.'
        )
      }
  
      const total_issues = total_response.data.total_count; 
      const closed_issues = closed_response.data.total_count; 

      return [{name: "total_issues", value: total_issues}, {name: "closed_issues", value: closed_issues}]

    } catch (err) {
      throw new Error(
        'Error getting project measures from GitHub. Please make sure you provided the host and token inputs.'
      )
  }
}

  public fetchGithubMetrics = async () : Promise<GithubMetricsResponse> => {
    const response: GithubMetricsResponse = {
      metrics: []
    }
    const baseUrl = `https://api.github.com`
    const urlCi = `${baseUrl}/repos/${this.owner}/${this.repository}`
    const throughtput = await this.getThroughput(baseUrl, this.label, this.beginDate); 

    if(throughtput){
      throughtput.forEach(githubmetric => response.metrics.push({
        name: githubmetric.name,
        value: githubmetric.value 
      }))
    }
    return response; 
  }
}