import { RequestService } from '../src/service/request-service';
import Service from '../src/service/service';
import { bodyCalculateCharacteristicsResponse, bodyCalculateMeasuresResponse, bodyCalculateTSQMIResponse, bodyCalculateSubcharacteristicsResponse, bodyListOrganizationsResponse, bodyListProductsResponse, bodyListReleaseResponse, bodyListRepositoriesResponse, bodySonarCloudResponseMetrics, githubMetricsAPIResponse, preConfigResponse } from './test-data/api-response';

describe('Create message Tests', () => {
    const owner = 'fga-eps-mds';
    const repositoryName = '2023-1-MeasureSoftGram-Action';
    let requestService: RequestService;
    let service: Service;
    const currentDate = new Date('2023-06-19T00:00:00-04:00');
    const orgId = 1;
    const productId = 1;
    const repositoryId = 1;
    const productName = 'MeasureSoftGram'
    const metrics = bodySonarCloudResponseMetrics;
    const githubMetrics = githubMetricsAPIResponse;

    beforeEach(() => {
        requestService = new RequestService();
        service = new Service(repositoryName, owner, productName, currentDate);
        jest.resetAllMocks();
    });

    test('should find the correct entity', async () => {
        const listOrganizations = bodyListOrganizationsResponse.results;

        const result: number = await service.checkEntityExists(listOrganizations, owner);

        expect(result).toBe(1);
    });

    test('should throw an error if the entity does not exist', async () => {
        const listOrganizations = bodyListOrganizationsResponse.results;

        await expect(service.checkEntityExists(listOrganizations, 'no-existent-organization')).rejects.toThrowError("Entity no-existent-organization does not exist.");
    });

    test('should not throw an error if there is an ongoing release', async () => {
        requestService.listReleases = jest.fn().mockResolvedValue(bodyListReleaseResponse);
        requestService.listOrganizations = jest.fn().mockResolvedValue(bodyListOrganizationsResponse);
        requestService.listProducts = jest.fn().mockResolvedValue(bodyListProductsResponse);
        requestService.listRepositories = jest.fn().mockResolvedValue(bodyListRepositoriesResponse);

        await expect(service.checkReleaseExists(requestService)).resolves.not.toThrowError();
    });

    test('should throw an error if there is no ongoing release', async () => {
        const nextMonth = new Date('2023-07-19T00:00:00-04:00');
        requestService.listReleases = jest.fn().mockResolvedValue(bodyListReleaseResponse);
        requestService.listOrganizations = jest.fn().mockResolvedValue(bodyListOrganizationsResponse);
        requestService.listProducts = jest.fn().mockResolvedValue(bodyListProductsResponse);
        requestService.listRepositories = jest.fn().mockResolvedValue(bodyListRepositoriesResponse);

        const service = new Service(repositoryName, owner, 'MeasureSoftGram2', nextMonth);

        await expect(service.checkReleaseExists(requestService)).rejects.toThrowError("No release is happening on 2023-07-19.");
    });

    it('should return the correct result when running the function to create metrics ', async () => {
        const service = new Service(repositoryName, owner, productName,currentDate);
        requestService.insertGithubMetrics = jest.fn()
        requestService.insertMetrics = jest.fn();
        requestService.calculateMeasures = jest.fn().mockResolvedValue(bodyCalculateMeasuresResponse);
        requestService.calculateCharacteristics = jest.fn().mockResolvedValue(bodyCalculateCharacteristicsResponse);
        requestService.calculateSubCharacteristics = jest.fn().mockResolvedValue(bodyCalculateSubcharacteristicsResponse);
        requestService.calculateTSQMI = jest.fn().mockResolvedValue(bodyCalculateTSQMIResponse);
        requestService.getCurrentPreConfig = jest.fn().mockResolvedValue(preConfigResponse); 

        const result = await service.createMetrics(requestService, metrics, githubMetrics, orgId, productId, repositoryId);

        expect(requestService.insertMetrics).toHaveBeenCalledWith(
            JSON.stringify(metrics),
            orgId,
            productId,
            repositoryId
        );
 
       expect(requestService.calculateMeasures).toHaveBeenCalledWith(orgId, productId, repositoryId, [{"key": "passed_tests"}, {"key": "tests_builds"}]);
        expect(requestService.calculateCharacteristics).toHaveBeenCalledWith(orgId, productId, repositoryId, [{"key": "reliability"}]);
        expect(requestService.calculateSubCharacteristics).toHaveBeenCalledWith(orgId, productId, repositoryId, [{"key": "reliability"}]);    
        expect(requestService.calculateTSQMI).toHaveBeenCalledWith(orgId, productId, repositoryId);

        expect(result).toEqual({
            data_characteristics: bodyCalculateCharacteristicsResponse,
            data_tsqmi: bodyCalculateTSQMIResponse
        });
    });

    it('should return the correct result when running the function to calculate result', async () => {
        requestService.insertMetrics = jest.fn();
        requestService.calculateMeasures = jest.fn().mockResolvedValue(bodyCalculateMeasuresResponse);
        requestService.calculateCharacteristics = jest.fn().mockResolvedValue(bodyCalculateCharacteristicsResponse);
        requestService.calculateSubCharacteristics = jest.fn().mockResolvedValue(bodyCalculateSubcharacteristicsResponse);
        requestService.calculateTSQMI = jest.fn().mockResolvedValue(bodyCalculateTSQMIResponse);
        requestService.listOrganizations = jest.fn().mockResolvedValue(bodyListOrganizationsResponse);
        requestService.listProducts = jest.fn().mockResolvedValue(bodyListProductsResponse);
        requestService.listRepositories = jest.fn().mockResolvedValue(bodyListRepositoriesResponse);
        requestService.listReleases = jest.fn().mockResolvedValue(bodyListReleaseResponse);
        requestService.getCurrentPreConfig = jest.fn().mockResolvedValue(preConfigResponse); 

        const result = await service.calculateResults(requestService, metrics, githubMetrics, orgId, productId, repositoryId);

        expect(result).toEqual([
            {
                "characteristics": [
                    {
                        "key": "reliability",
                        "value": 0.9254618113429579
                    }
                ],
                "measures": [],
                "repository": [],
                "tsqmi": [
                    { 
                        "key": "tsqmi", 
                        "value": 0.8359399436161667 
                    }], 
                    "subcharacteristics": [], 
                    "version": []
            }]);
    });
});