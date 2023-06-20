import Service from '../src/service/service';
import { bodyListOrganizationsResponse, bodyListReleaseResponse, bodySonarCloudResponseMetrics } from './test-data/api-response';

describe('Create message Tests', () => {
    const owner = 'fga-eps-mds';
    const repo = 'repo';

    let currentDate = new Date('2023-06-19T00:00:00-04:00');

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('should find the correct entity', async () => {        
        const service = new Service(repo, owner, 'productName', bodySonarCloudResponseMetrics, currentDate);
        const listOrganizations = bodyListOrganizationsResponse.results;
        
        const result: number = await service.checkEntityExists(listOrganizations, owner);

        expect(result).toBe(1);
    });

    test('should throw an error if the entity does not exist', async () => {
        const service = new Service(repo, owner, 'productName', bodySonarCloudResponseMetrics, currentDate);
        const listOrganizations = bodyListOrganizationsResponse.results;
        
        await expect(service.checkEntityExists(listOrganizations, 'no-existent-organization')).rejects.toThrowError("Entity no-existent-organization does not exist.");
    });

    test('should not throw an error if there is an ongoing release', async () => {
        const service = new Service(repo, owner, 'productName', bodySonarCloudResponseMetrics, currentDate);
        const listReleases = bodyListReleaseResponse;
        const orgId = 1;
        const productId = 1;

        await expect(service.checkReleaseExists(listReleases, orgId, productId)).resolves.not.toThrowError();
    });

    test('should throw an error if there is no ongoing release', async () => {
        currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1)); // add one month to the current date

        const service = new Service(repo, owner, 'productName', bodySonarCloudResponseMetrics, currentDate);
        const listReleases = bodyListReleaseResponse;
        const orgId = 1;
        const productId = 1;

        await expect(service.checkReleaseExists(listReleases, orgId, productId)).rejects.toThrowError("No release is happening on 2023-07-19.");
    });
});