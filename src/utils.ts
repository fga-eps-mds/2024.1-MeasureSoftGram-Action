import * as core from '@actions/core';

export interface Info {
    project: {
        projectKey: string
        projectBaseDir: string
    }
    host: string
    token: string
}

export function getInfo(repo: { owner: string; repo: string }): Info {
    return {
        project: {
            projectKey: core.getInput('projectKey')
                ? core.getInput('projectKey')
                : `${repo.owner}_${repo.repo}`,
            projectBaseDir: core.getInput('projectBaseDir'),
        },
        host: core.getInput('host'),
        token: core.getInput('token'),
    }
};