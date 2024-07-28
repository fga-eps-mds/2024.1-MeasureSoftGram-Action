import axios, { AxiosInstance } from 'axios';
import { GitHubInfo } from './utils';
import { Info } from './utils';

export interface MetricsResponseAPI {
  total_issues: number, 
  closed_issues: number
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

  public getMeasures = async () : Promise<MetricsResponseAPI> => {
    try {
      let github_url = (state: string) : string => {
        return `/repos/${this.owner}/${this.repository}/issues?state=${state}&labels=${label}`
      }
      
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

      return {"total_issues": total_issues, "closed_issues": closed_issues}

    } catch (err) {
      throw new Error(
        'Error getting project measures from GitHub. Please make sure you provided the host and token inputs.'
      )
    }
  }
}