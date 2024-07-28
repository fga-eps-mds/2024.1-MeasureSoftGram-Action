import { Organization, Product, Repository, RequestService, ResponseCalculateCharacteristics, ResponseListReleases } from "./request-service";
import { MetricsResponseAPI } from '../sonarqube';

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

    public async checkReleaseExists(requestService: RequestService): Promise<string> {
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
        return responseStart;
    }

    public async createMetrics(requestService: RequestService, metrics: MetricsResponseAPI, orgId: number, productId: number, repositoryId: number) {
        const string_metrics = JSON.stringify(metrics);
        console.log('Calculating metrics, measures, characteristics and subcharacteristics');

        await requestService.insertMetrics(string_metrics, orgId, productId, repositoryId);
        const data_measures = await requestService.calculateMeasures(orgId, productId, repositoryId);
        console.log('Calculated measures: \n', data_measures);

        const data_characteristics = await requestService.calculateCharacteristics(orgId, productId, repositoryId);
        console.log('Calculated characteristics: \n', data_characteristics);

        const data_subcharacteristics = await requestService.calculateSubCharacteristics(orgId, productId, repositoryId);
        console.log('Calculated subcharacteristics: \n', data_subcharacteristics);

        const data_tsqmi = await requestService.calculateTSQMI(orgId, productId, repositoryId);
        console.log('TSQMI: \n', data_tsqmi);

        return { data_characteristics, data_tsqmi };
    }

    public async calculateResults(requestService: RequestService, metrics: MetricsResponseAPI) {
        this.logRepoInfo();
        const { data_characteristics, data_tsqmi } = await this.createMetrics(requestService, this.metrics, orgId, productId, repositoryId);

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
