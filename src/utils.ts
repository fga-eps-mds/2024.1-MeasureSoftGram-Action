import * as core from '@actions/core';
import GithubComment from './github/github-comment';

export interface Info {
    project: {
        sonarProjectKey: string
    }
    host: string
    token: string
}

export function getInfo(repo: { owner: string; repo: string }): Info {
    return {
        project: {
            sonarProjectKey: core.getInput('sonarProjectKey')
                ? core.getInput('sonarProjectKey')
                : `${repo.owner}_${repo.repo}`,
        },
        host: core.getInput('host'),
        token: core.getInput('sonarToken'),
    }
}

export interface GitHubInfo{
    owner: string
    repo: string
    label: string
    token: string
    begin_date: Date
}

export function getGitHubInfo(repo: {owner: string, repo: string }, begin_date: Date): GitHubInfo {
   return {
    owner: repo.owner, 
    repo: repo.repo, 
    label: core.getInput('usLabel'), 
    token: core.getInput('gitHubToken'),
    begin_date: begin_date
   } 
}