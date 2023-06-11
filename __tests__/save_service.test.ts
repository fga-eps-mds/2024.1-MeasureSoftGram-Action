import { SaveService } from '../src/save_service';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('SaveService', () => {
    let service: SaveService;
    let mockAxios: MockAdapter;

    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
        service = new SaveService();
    });

    afterEach(() => {
        mockAxios.restore();
    });

    test('should successfully fetch organizations', async () => {
        const organizations = [{ id: 1, name: 'org1' }];
        mockAxios.onGet('http://127.0.0.1:8080/api/v1/organizations/').reply(200, organizations);

        const response = await service.listOrganizations();

        expect(response).toEqual(organizations);
    });

    test('should successfully fetch products', async () => {
        const products = [{ id: 1, name: 'product1' }];
        mockAxios.onGet('http://127.0.0.1:8080/api/v1/organizations/1/products/').reply(200, products);

        const response = await service.listProducts(1);

        expect(response).toEqual(products);
    });

    test('should successfully fetch repositories', async () => {
        const repositories = [{ id: 1, name: 'repo1' }];
        mockAxios.onGet('http://127.0.0.1:8080/api/v1/organizations/1/products/1/repositories/').reply(200, repositories);

        const response = await service.listRepositories(1, 1);

        expect(response).toEqual(repositories);
    });

    test('should successfully create an organization', async () => {
        const organization = { name: 'org2', description: 'desc' };
        mockAxios.onPost('http://127.0.0.1:8080/api/v1/organizations/').reply(200, organization);

        await service.createOrganization('org2', 'desc');

        expect(mockAxios.history.post.length).toBe(1);
        expect(mockAxios.history.post[0].data).toEqual(JSON.stringify({ name: 'org2', description: 'desc' }));
    });
    // similarly write test for listProducts and listRepositories and other methods...
});
