import { RequestService, ResponseCalculateCharacteristics } from "./request-service";
import { MetricsResponseAPI } from '../sonarqube';

export interface CalculatedMsgram {
    repository: { key: string; value: string }[];
    version: { key: string; value: string }[];
    measures: { key: string; value: number }[];
    subcharacteristics: { key: string; value: number }[];
    characteristics: { key: string; value: number }[];
    sqc: { key: string; value: number }[];
}

export default class Service {
    private repo: string;
    private owner: string;
    private requestService: any;
    private currentDate: Date;
    private productName: string;
    private metrics: MetricsResponseAPI;

    constructor(repo: string, owner: string, requestService: RequestService, productName: string, metrics: MetricsResponseAPI) {
        this.repo = repo;
        this.owner = owner;
        this.requestService = requestService;
        this.currentDate = new Date();
        this.productName = productName;
        this.metrics = metrics;
    }

    private logRepoInfo() {
        console.log(`Repo: ${this.repo}`);
        console.log(`Owner: ${this.owner}`);
    }

    public async checkOrganizationExists(): Promise<number> {
        const inputOrganization = this.owner;
        console.log(`Organization: ${inputOrganization}`);

        const response = await this.requestService.listOrganizations();
        const organizations = response.results;

        let orgId = null;
        let organizationExists = false;

        for (const org of organizations) {
            if (org.name === inputOrganization) {
                organizationExists = true;
                orgId = org.id;
                break;
            }
        }

        if (!organizationExists) {
            throw new Error(`Organization ${inputOrganization} does not exist.`);
        } else {
            console.log(`Organization ${inputOrganization} exists with id ${orgId}.`);
        }

        return orgId;
    }

    public async checkProductExists(requestService: RequestService, productName: string, orgId: number): Promise<number> {
        const response = await requestService.listProducts(orgId);
        const products = response.results;

        let productId = null;

        for (const product of products) {
            if (product.name === productName) {
                productId = product.id;
                break;
            }
        }

        if (!productId) {
            throw new Error(`Product ${productName} does not exist.`);
        } else {
            console.log(`Product ${productName} exists with id ${productId}.`);
        }

        return productId;
    }

    public async checkRepositoryExists(requestService: RequestService, orgId: number, productId: number): Promise<number> {
        const responseRepositories = await requestService.listRepositories(orgId, productId);
        const repositories = responseRepositories.results;

        let repositoryId = null;

        for (const repository of repositories) {
            if (repository.name === this.repo) {
                repositoryId = repository.id;
                break;
            }
        }

        if (repositoryId === null) {
            throw new Error(`Repository ${this.repo} does not exist.`);
        } else {
            console.log(`Repository ${this.repo} exists with id ${repositoryId}.`);
        }

        return repositoryId;
    }

    public async checkReleaseExists(requestService: RequestService, orgId: number, productId: number): Promise<void> {
        const responseReleases = await requestService.listReleases(orgId, productId);

        const currentDateStr = this.currentDate.toISOString().split('T')[0];

        let releaseId = null;

        for (const release of responseReleases) {
            const startAt = release.start_at.split('T')[0];
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

        const data_sqc = await requestService.calculateSQC(orgId, productId, repositoryId);
        console.log('SQC: \n', data_sqc);

        return { data_characteristics, data_sqc };
    }

    public async run() {
        this.logRepoInfo();
        const orgId: number = await this.checkOrganizationExists();
        const productId: number = await this.checkProductExists(this.requestService, this.productName, orgId);
        const repositoryId: number = await this.checkRepositoryExists(this.requestService, orgId, productId);
        await this.checkReleaseExists(this.requestService, orgId, productId);
        const { data_characteristics, data_sqc } = await this.createMetrics(this.requestService, this.metrics, orgId, productId, repositoryId);

        const characteristics = data_characteristics.map((data: ResponseCalculateCharacteristics) => {
            return {
                key: data.key,
                value: data.latest.value
            };
        });

        const sqc = [{
            key: 'sqc',
            value: data_sqc.value
        }];

        const result: Array<CalculatedMsgram> = [{
            repository: [],
            version: [],
            measures: [],
            subcharacteristics: [],
            characteristics: characteristics,
            sqc: sqc
        }];

        console.log('Result: \n', result);
        return result;
    }
}
