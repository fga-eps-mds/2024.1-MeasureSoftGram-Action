import axios, { AxiosInstance } from 'axios';
import * as core from '@actions/core';

export default class Sonarqube {
  private http: AxiosInstance
  public host: string
  private token: string
  public project: {
    projectKey: string
    projectBaseDir: string
  }
  private sonarMetrics = [
      'files',
      'functions',
      'complexity',
      'comment_lines_density',
      'duplicated_lines_density',
      'coverage',
      'ncloc',
      'tests',
      'test_errors',
      'test_failures',
      'test_execution_time',
      'security_rating',
      'test_success_density',
      'reliability_rating',
  ]

  constructor(repo: { owner: string; repo: string }) {
      const info = this.getInfo(repo)

      this.host = info.host
      this.token = info.token
      this.project = info.project
      const tokenb64 = Buffer.from(`${this.token}:`).toString('base64')

      console.log(`SonarQube host: ${this.host}`)
      console.log(`SonarQube project: ${this.project.projectKey}`)

      this.http = axios.create({
          baseURL: this.host,
          timeout: 10000,
          headers: {
            Authorization: this.token ? `Basic ${tokenb64}` : "",
          }
      })
  }

  private getInfo = (repo: { owner: string; repo: string }) => ({
    project: {
        projectKey: core.getInput('projectKey')
            ? core.getInput('projectKey')
            : `${repo.owner}_${repo.repo}`,
        projectBaseDir: core.getInput('projectBaseDir'),
    },
    host: core.getInput('host'),
    token: core.getInput('token'),
  })
}