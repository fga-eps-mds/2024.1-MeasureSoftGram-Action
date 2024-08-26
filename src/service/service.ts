import { Organization, Product, Repository, RequestService, ResponseCalculateCharacteristics, ResponseListReleases } from "./request-service";
import { MetricsResponseAPI } from '../sonarqube';
import { GithubMetricsResponse } from "../github";
import { CalculateRequestData, parsePreConfig, PreConfig } from "../utils";

export interface CalculatedMsgram {
    repository: { key: string; value: string }[];
    version: { key: string; value: string }[];
    measures: { key: string; value: number }[];
    subcharacteristics: { key: string; value: number }[];
    characteristics: { key: string; value: number }[];
    tsqmi: { key: string; value: number }[];
}

export default class Service {
    private repo: string;
    private owner: string;
    private currentDate: Date;
    private productName: string;

    constructor(repo: string, owner: string, productName: string, currentDate: Date) {
        this.repo = repo;
        this.owner = owner;
        this.currentDate = currentDate;
        this.productName = productName;
    }

    private logRepoInfo() {
        console.log(`Repo: ${this.repo}`);
        console.log(`Owner: ${this.owner}`);
    }

    public async checkEntityExists(entities: Array<Product | Repository | Organization>, name: string): Promise<number> {
        let entityId = null;

        for (const entity of entities) {
            if (entity.name === name) {
                entityId = entity.id; 
                break;
            }
        }

        if (!entityId) {
            throw new Error(`Entity ${name} does not exist.`);
        } else {
            return entityId;
        }
    }

    public async checkReleaseExists(requestService: RequestService): Promise<{startAt: string, orgId: number, productId: number, repositoryId: number}> {
        const listOrganizations = await requestService.listOrganizations();
        const orgId: number = await this.checkEntityExists(listOrganizations.results, this.owner);
        console.log('orgId ', orgId);
    
        const listProducts = await requestService.listProducts(orgId);
        const productId: number = await this.checkEntityExists(listProducts.results, this.productName);
        console.log('productId ', productId)
        
        const listRepositories = await requestService.listRepositories(orgId, productId);
        const repositoryId: number = await this.checkEntityExists(listRepositories.results, this.repo);
    
        const listReleases: Array<ResponseListReleases> = await requestService.listReleases(orgId, productId);
        const currentDateStr = this.currentDate.toISOString().split('T')[0];

        let releaseId = null;
        let startAt = ""; 
        let responseStart = ""; 
        for (const release of listReleases) {
            responseStart = release.start_at; 
            startAt = release.start_at.split('T')[0];
            const endAt = release.end_at.split('T')[0];

            if (currentDateStr >= startAt && currentDateStr <= endAt) {
                releaseId = release.id;
                break;
            }
        }

        if (releaseId === null) {
            throw new Error(`No release is happening on ${currentDateStr}.`);
        } else {
            console.log(`Release with id ${releaseId} is happening on ${currentDateStr}.`);
        }
        return {startAt: responseStart, orgId: orgId, productId: productId, repositoryId: repositoryId}
    }

    public async createMetrics(requestService: RequestService, metrics: MetricsResponseAPI | null, githubMetrics: GithubMetricsResponse | null, orgId: number, productId: number, repositoryId: number) {
        
        if(metrics !== null) {
            const string_metrics = JSON.stringify(metrics);
            console.log('Calculating metrics, measures, characteristics and subcharacteristics');
    
            await requestService.insertMetrics(string_metrics, orgId, productId, repositoryId);
        }
        
        if(githubMetrics) {
            await requestService.insertGithubMetrics(githubMetrics, orgId, productId, repositoryId);
        }
        
        const currentPreConfig: PreConfig = await requestService.getCurrentPreConfig(orgId, productId); 
        const currentPreConfigParsed = parsePreConfig(currentPreConfig); 
        const data_measures = await requestService.calculateMeasures(orgId, productId, repositoryId, currentPreConfigParsed.measures);
        console.log('Calculated measures: \n', data_measures);
        
        const data_subcharacteristics = await requestService.calculateSubCharacteristics(orgId, productId, repositoryId, currentPreConfigParsed.subcharacteristics);
        console.log('Calculated subcharacteristics: \n', data_subcharacteristics);

        const data_characteristics = await requestService.calculateCharacteristics(orgId, productId, repositoryId, currentPreConfigParsed.characteristics);
        console.log('Calculated characteristics: \n', data_characteristics);


        const data_tsqmi = await requestService.calculateTSQMI(orgId, productId, repositoryId);
        console.log('TSQMI: \n', data_tsqmi);

        return { data_characteristics, data_tsqmi };
    }

    public async calculateResults(requestService: RequestService, metrics: MetricsResponseAPI | null, githubMetrics: GithubMetricsResponse | null, orgId: number, productId: number, repositoryId: number) {
        this.logRepoInfo();
        const { data_characteristics, data_tsqmi } = await this.createMetrics(requestService, metrics, githubMetrics, orgId, productId, repositoryId);

        const characteristics = data_characteristics.map((data: ResponseCalculateCharacteristics) => {
            return {
                key: data.key,
                value: data.latest.value
            };
        });

        const tsqmi = [{
            key: 'tsqmi',
            value: data_tsqmi.value
        }];

        const result: Array<CalculatedMsgram> = [{
            repository: [],
            version: [],
            measures: [],
            subcharacteristics: [],
            characteristics: characteristics,
            tsqmi: tsqmi
        }];

        console.log('Result: \n', JSON.stringify(result));
        return result;
    }
}
