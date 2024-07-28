import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import {
  bodyCalculateCharacteristicsResponse,
  bodyCalculateSubcharacteristicsResponse,
  bodyCalculateTSQMIResponse,
  bodyCalculateMeasuresResponse,
  bodyInsertMetricsResponse,
  githubMetricsAPIResponse
} from './test-data/api-response';
import { RequestService } from '../src/service/request-service';

describe('RequestService', () => {
  let service: RequestService;
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    service = new RequestService();
    service.setMsgToken('secret');
  });

  afterEach(() => {
    mockAxios.restore();
  });

  test('should return the correct base URL', () => {
    const baseUrl = service.getBaseUrl();
    expect(baseUrl).toBe(service.getBaseUrl());
  });

  test('should return the correct MSG_TOKEN', () => {
    const msgToken = service.getMsgToken();
    expect(msgToken).toBe('secret');
  });

  test('should set the correct MSG_TOKEN', () => {
    service.setMsgToken('secret');
    const msgToken = service.getMsgToken();
    expect(msgToken).toBe('secret');
  });

  test('should successfully fetch organizations', async () => {
    const organizations = [{ id: 1, name: 'org1' }];
    mockAxios.onGet(`${service.getBaseUrl()}organizations/`).reply(200, organizations);

    const response = await service.listOrganizations();

    expect(response).toEqual(organizations);
  });

  test('should successfully fetch products', async () => {
    const products = [{ id: 1, name: 'product1' }];
    mockAxios.onGet(`${service.getBaseUrl()}organizations/1/products/`).reply(200, products);

    const response = await service.listProducts(1);

    expect(response).toEqual(products);
  });

  test('should successfully fetch repositories', async () => {
    const repositories = [{ id: 1, name: 'repo1' }];
    mockAxios.onGet(`${service.getBaseUrl()}organizations/1/products/1/repositories/`).reply(200, repositories);

    const response = await service.listRepositories(1, 1);

    expect(response).toEqual(repositories);
  });

  test('should fetch releases', async () => {
    const releases = [
      { "id": 12, "release_name": "5", "start_at": "2023-06-06T00:00:00-03:00", "created_by": 11, "end_at": "2023-06-13T00:00:00-03:00" },
      { "id": 11, "release_name": "Release 001", "start_at": "2023-12-20T00:00:00-03:00", "created_by": 66, "end_at": "2023-12-25T00:00:00-03:00" },
      { "id": 10, "release_name": "teste", "start_at": "2023-06-05T00:00:00-03:00", "created_by": 80, "end_at": "2023-06-12T00:00:00-03:00" }
    ];
    mockAxios.onGet(`${service.getBaseUrl()}organizations/1/products/3/release/all`).reply(200, { results: releases });

    const response = await service.listReleases(1, 3);

    expect(response).toEqual(releases);
  });


  test('should successfully insert metrics', async () => {
    const metrics = '{"metric1":"value1", "metric2":"value2"}'; // a JSON string
    const orgId = 1;
    const productId = 1;
    const repoId = 1;

    const expectedUrl = `${service.getBaseUrl()}organizations/${orgId}/products/${productId}/repositories/${repoId}/collectors/sonarqube/`;

    mockAxios.onPost(expectedUrl).reply(200, bodyInsertMetricsResponse);

    const result = await service.insertMetrics(metrics, orgId, productId, repoId);

    expect(mockAxios.history.post.length).toBe(1);
    expect(JSON.parse(mockAxios.history.post[0].data)).toEqual(JSON.parse(metrics));
    expect(mockAxios.history.post[0].url).toBe(expectedUrl);
    expect(result).toEqual(bodyInsertMetricsResponse);
  });

  test('should successfully insert github metrics', async () => {
    const metrics = githubMetricsAPIResponse;
    const orgId = 1;
    const productId = 1;
    const repoId = 1;

    const expectedUrl = `${service.getBaseUrl()}organizations/${orgId}/products/${productId}/repositories/${repoId}/collectors/github/`;

    mockAxios.onPost(expectedUrl).reply(200, bodyInsertMetricsResponse);

    const result = await service.insertGithubMetrics(metrics, orgId, productId, repoId);

    expect(mockAxios.history.post.length).toBe(1);
    expect(JSON.parse(mockAxios.history.post[0].data)).toEqual(metrics);
    expect(mockAxios.history.post[0].url).toBe(expectedUrl);
  });

  test('should successfully calculate measures', async () => {
    const orgId = 1;
    const productId = 1;
    const repoId = 1;
    mockAxios.onPost(`${service.getBaseUrl()}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/measures/`)
      .reply(200, bodyCalculateMeasuresResponse);

    const response = await service.calculateMeasures(orgId, productId, repoId);

    expect(mockAxios.history.post.length).toBe(1);
    expect(mockAxios.history.post[0].data).toBeDefined();
    expect(response).toEqual(bodyCalculateMeasuresResponse);
  });

  test('should successfully calculate characteristics', async () => {
    const orgId = 1;
    const productId = 1;
    const repoId = 1;

    mockAxios.onPost(`${service.getBaseUrl()}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/characteristics/`)
      .reply(200, bodyCalculateCharacteristicsResponse);

    const response = await service.calculateCharacteristics(orgId, productId, repoId);

    expect(mockAxios.history.post.length).toBe(1);
    expect(mockAxios.history.post[0].data).toBeDefined();
    expect(response).toEqual(bodyCalculateCharacteristicsResponse);
  });

  test('should successfully calculate sub-characteristics', async () => {
    const orgId = 1;
    const productId = 1;
    const repoId = 1;

    mockAxios.onPost(`${service.getBaseUrl()}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/subcharacteristics/`)
      .reply(200, bodyCalculateSubcharacteristicsResponse);

    const response = await service.calculateSubCharacteristics(orgId, productId, repoId);

    expect(mockAxios.history.post.length).toBe(1);
    expect(mockAxios.history.post[0].data).toBeDefined();
    expect(response).toEqual(bodyCalculateSubcharacteristicsResponse);
  });

  test('should successfully calculate TSQMI', async () => {
    const orgId = 1;
    const productId = 1;
    const repoId = 1;

    mockAxios.onPost(`${service.getBaseUrl()}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/tsqmi/`)
      .reply(200, bodyCalculateTSQMIResponse);

    const response = await service.calculateTSQMI(orgId, productId, repoId);

    expect(mockAxios.history.post.length).toBe(1);
    expect(mockAxios.history.post[0].data).toBeDefined();
    expect(response).toEqual(bodyCalculateTSQMIResponse);
  });

  test('should throw error in case API call fails', async () => {
    const errorMsg = "No data received from the API.";

    mockAxios.onGet().reply(() => [500, { message: 'API Error' }]);

    const listOrganizationsExecution = service.listOrganizations();

    await expect(listOrganizationsExecution).rejects.toThrow(errorMsg);
  });

  test('should throw error in case no data received from the API in listReleases', async () => {
    const errorMsg = 'No data received from the API.';

    mockAxios.onGet().reply(200, null); // Returns a successful status but no data

    const listOrganizationsExecution = service.listOrganizations();

    await expect(listOrganizationsExecution).rejects.toThrow(errorMsg);
  });

  test('should throw error in case network error in listOrganizations', async () => {
    const errorMsg = 'No data received from the API.';

    mockAxios.onGet().networkError();

    const listOrganizationsExecution = service.listOrganizations();

    await expect(listOrganizationsExecution).rejects.toThrow(errorMsg);
  });
});
