import axios from 'axios';
import Sonarqube from '../src/sonarqube';
import { GitHubInfo, Info } from '../src/utils';
import GithubAPIService from '../src/github';
import { githubMetricsAPIThroughput } from './test-data/api-response';


jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const githubMetrics = githubMetricsAPIThroughput;

describe('Github', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    mockedAxios.create.mockClear();
    mockedAxios.get.mockClear();
  });

  test('Constructor should initialize correctly with given data', () => {
    const githubInfo: GitHubInfo = {
        owner: 'testOwner', 
        repo: 'testRepo',
        label: 'mockUsLabel',
        token: 'mockGithubToken',
        beginDate: '2024-07-22T00:00:00-03:00', 
    };

    const tokenb64 = Buffer.from(`${githubInfo.token}:`).toString('base64');

    const githubApiService = new GithubAPIService(githubInfo);
    console.log(githubApiService)

  });


  test('getMeasures should make a correct axios call', async () => {
    const githubInfo: GitHubInfo = {
      owner: 'testOwner', 
      repo: 'testRepo',
      label: 'mockUsLabel',
      token: 'mockGithubToken',
      beginDate: '2024-07-22T00:00:00-03:00', 
  };

    const githubIssuesResponse = {
      status: 200,
      data: {
        total_count: 2, 
        incomplete_results: false,
        items: []
      }
    } 

    const githubClosedIssuesResponse = {
      status: 200, 
      data: {
        total_count: 1, 
        incomplete_results: false,
        items: []
      }
    } 

    const githubClosedUrl = `http://api.github.com/search/issues?q=repo:testOwner/testRepo is:issue updated:>${githubInfo.beginDate} label:${githubInfo.label} state:closed`
    const githubUrl = `http://api.github.com/search/issues?q=repo:testOwner/testRepo is:issue updated:>${githubInfo.beginDate} label:${githubInfo.label}`

    mockedAxios.get.mockImplementationOnce(async (url, options) => {
      console.log(`URL: ${url}`);
      console.log(`Options: ${JSON.stringify(options)}`);
      if (url === githubUrl) {
        return Promise.resolve(githubIssuesResponse);
      }
      else if(url == githubClosedUrl){
        return Promise.resolve(githubClosedIssuesResponse); 
      } 
      return Promise.reject('Unexpected URL or options');
    });



    mockedAxios.create.mockImplementationOnce(() => mockedAxios);

    const github = new GithubAPIService(githubInfo);
    
    try {
      const measures = await github.fetchGithubMetrics("build");
      expect(measures).toBe(githubMetrics);
      expect(mockedAxios.get).toHaveBeenCalledWith(githubUrl);
      expect(mockedAxios.get).toHaveBeenCalledWith(githubClosedUrl);
    } catch (error) {
      console.log('Error in test: ', error);
      throw error;
    }
  });

  test('getMeasures should handle axios errors', async () => {
    const info: Info = {
      host: 'http://localhost:9000',
      token: '123456',
      project: {
        sonarProjectKey: 'sonarProjectKey',
      },
    };

    mockedAxios.get.mockImplementationOnce(async () => {
      return Promise.reject(new Error('API call failed'));
    });

    mockedAxios.create.mockImplementationOnce(() => mockedAxios);

    const sonarqube = new Sonarqube(info);
    const pageSize = 500;
    await expect(sonarqube.getMeasures({ pageSize, pullRequestNumber: null })).rejects.toThrow('Error getting project measures from SonarQube. Please make sure you provided the host and token inputs.');
  });

  test('getMeasures should handle non-200 status codes', async () => {
    const info: Info = {
      host: 'http://localhost:9000',
      token: '123456',
      project: {
        sonarProjectKey: 'sonarProjectKey',
      },
    };
  
    mockedAxios.get.mockImplementationOnce(async () => {
      return Promise.resolve({
        status: 400, // Non-200 status
        data: null, // No data
      });
    });
  
    mockedAxios.create.mockImplementationOnce(() => mockedAxios);
  
    const sonarqube = new Sonarqube(info);
    const pageSize = 500;
    await expect(sonarqube.getMeasures({ pageSize, pullRequestNumber: 3 })).rejects.toThrow('Error getting project measures from SonarQube. Please make sure you provided the host and token inputs.');
  });
  
});
