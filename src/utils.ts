import * as core from '@actions/core';

export interface Info {
    project: {
        projectKey: string
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
        },
        host: core.getInput('host'),
        token: core.getInput('token'),
    }
}