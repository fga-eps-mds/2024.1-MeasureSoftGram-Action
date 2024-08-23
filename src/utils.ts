import * as core from '@actions/core';
import GithubComment from './github/github-comment';

export interface Info {
    project: {
        sonarProjectKey: string
    }
    host: string
    token: string
}

export interface Measure{
    key: string
    weight: number
    max_threshold: number
    min_threshold: number
    metrics: { key: string }[]
}

export interface Subcharacteristics{
    key: string
    weight: number
    measures: Measure[]
}
export interface Characteristic {
    key: string
    weight: number
    subcharacteristics: Subcharacteristics[]
}

export interface PreConfig {
    characteristics: Characteristic[]
}

export class CalculateRequestData {
    characteristics: {key: string}[];   
    subcharacteristics: {key: string}[]; 
    measures: {key: string}[]; 
    metrics: {key: string}[]; 

    constructor(){
        this.characteristics = []; 
        this.subcharacteristics = []; 
        this.measures = []; 
        this.metrics = [];
    }

    addMeasureAndMetrics(measure: Measure){
        this.measures.push({key: measure.key})
        this.metrics.concat(measure.metrics)
    }

    addCharacteristic(characteristic: Characteristic){
        this.characteristics.push({key: characteristic.key})
    }

    addSubcharacteristic(subcharacteristic: Subcharacteristics){
        this.subcharacteristics.push({key: subcharacteristic.key})
    }
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
    beginDate: string
}

export function getGitHubInfo(repo: {owner: string, repo: string }, beginDate: string): GitHubInfo {
   return {
    owner: repo.owner, 
    repo: repo.repo, 
    label: core.getInput('usLabel'), 
    token: core.getInput('gitHubToken'),
    beginDate: beginDate
   } 
}

export function parsePreConfig(preConfig: PreConfig): CalculateRequestData{
    console.log(preConfig);
    let response = new CalculateRequestData();

    for(const characteristic of preConfig.characteristics){
       response.addCharacteristic(characteristic); 
        for(const subcharacteristic of characteristic.subcharacteristics){
            response.addSubcharacteristic(subcharacteristic);
            for(const measure of subcharacteristic.measures){
              response.addMeasureAndMetrics(measure);
            }   
        }
    }
    
    return response; 
}

 
