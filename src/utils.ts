import * as core from '@actions/core';

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