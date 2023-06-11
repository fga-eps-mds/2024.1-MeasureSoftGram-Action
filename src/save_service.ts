import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

export class SaveService {
    private MSGRAM_SERVICE_HOST = 'http://127.0.0.1:8080/';
    private MSG_TOKEN = 'Token f3d5a62d7a8ef51cc823c24a21ed92418cb05c43';
    private baseUrl = `${this.MSGRAM_SERVICE_HOST}api/v1/`;

    constructor () { }

    public getBaseUrl(): string {
        return this.baseUrl;
    }

    public getMsgToken(): string {
        return this.MSG_TOKEN;
    }
    
    private async makeRequest(method: 'get' | 'post', url: string, data: Object = {}): Promise<AxiosResponse | null> {
        const config: AxiosRequestConfig = {
            headers: {
                Authorization: this.MSG_TOKEN,
            },
            method,
            url,
            data,
        };

        try {
            const response = await axios(config);
            console.log(`Data ${method === 'get' ? 'received' : 'sent'}. Status code: ${response.status}`);
            return response;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                console.error(`Failed to ${method} data to the API. ${axiosError.message}`);
            } else {
                console.error('An unexpected error occurred.');
            }
        }
        return null;
    }

    public async listOrganizations(): Promise<any> {
        const url = `${this.baseUrl}organizations/`;
        const response = await this.makeRequest('get', url);
        return response?.data;
    }

    public async listProducts(orgId = 2): Promise<any> {
        const url = `${this.baseUrl}organizations/${orgId}/products/`;
        const response = await this.makeRequest('get', url);
        return response?.data;
    }

    public async listRepositories(orgId = 2, productId = 2): Promise<any> {
        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/`;
        const response = await this.makeRequest('get', url);
        return response?.data;
    }

    public async createOrganization(org: string, description:string): Promise<void> {
        const url = `${this.baseUrl}organizations/`;
        const data = { name: org, description: description };
        await this.makeRequest('post', url, data);
    }

    public async createProduct(product: string, description: string, orgId: number): Promise<void> {
        const url = `${this.baseUrl}organizations/${orgId}/products/`;
        const data = { name: product, description: description };
        await this.makeRequest('post', url, data);
    }

    public async createRepository(repo: string, description: string, orgId: number, productId: number): Promise<void> {
        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/`;
        const data = { name: repo, description: description };
        await this.makeRequest('post', url, data);
    }

    public async createMetrics(metrics: string, orgId: number, productId: number, repoId: number): Promise<void> {
        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/collectors/sonarqube/`;
        const data = { metrics: metrics };
        await this.makeRequest('post', url, data);
    }

    public async calculateMeasures(orgId: number, productId: number, repoId: number): Promise<void> {
        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/measures/`;
        const data = { measures: [ { key: "passed_tests" }, { key: "test_builds" }, { key: "test_coverage" }, { key: "non_complex_file_density" }, { key: "commented_file_density" }, { key: "duplication_absense" } ] };
        await this.makeRequest('post', url, { data: data });
    }

    public async calculateCharacteristics(orgId: number, productId: number, repoId: number): Promise<void> {
        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/characteristics/`;
        const data = { characteristics: [ { key: "reliability" }, { key: "maintainability" } ] };
        await this.makeRequest('post', url, { data: data });
    }

    public async calculateSubCharacteristics(orgId: number, productId: number, repoId: number): Promise<void> {
        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/subcharacteristics/`;
        const data = { subcharacteristics: [ { key: "modifiability" }, { key: "testing_status" } ] };
        await this.makeRequest('post', url, { data: data });
    }

    public async calculateSQC(orgId: number, productId: number, repoId: number): Promise<void> {
        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/sqc/`;
        await this.makeRequest('post', url);
    }
}
