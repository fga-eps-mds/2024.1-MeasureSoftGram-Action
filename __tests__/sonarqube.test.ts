import axios from 'axios';
import Sonarqube from '../src/sonarqube';
import { Info } from '../src/utils';


jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Sonarqube', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    mockedAxios.create.mockClear();
    mockedAxios.get.mockClear();
  });

  test('getMeasures should make a correct axios call', async () => {
    const info: Info = {
      host: 'http://localhost:9000',
      token: '123456',
      project: {
        projectKey: 'projectKey',
      },
    };

    const measuresResponse = { 
      data: { 
        paging: {
          pageIndex: 1,
          pageSize: 10,
          total: 50
        },
        baseComponent: {},
        components: [],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };

    mockedAxios.get.mockImplementationOnce(async (url, options) => {
      console.log(`URL: ${url}`);
      console.log(`Options: ${JSON.stringify(options)}`);
      if (url === `/api/measures/component_tree?component=${info.project.projectKey}&metricKeys=files,functions,complexity,comment_lines_density,duplicated_lines_density,coverage,ncloc,tests,test_errors,test_failures,test_execution_time,security_rating,test_success_density,reliability_rating&ps=500`) {
        return Promise.resolve(measuresResponse);
      }
      return Promise.reject('Unexpected URL or options');
    });

    mockedAxios.create.mockImplementationOnce(() => mockedAxios);

    const sonarqube = new Sonarqube(info);
    const pageSize = 500;
    try {
      const measures = await sonarqube.getMeasures({ pageSize });
      expect(measures).toBe(measuresResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(`/api/measures/component_tree?component=${info.project.projectKey}&metricKeys=files,functions,complexity,comment_lines_density,duplicated_lines_density,coverage,ncloc,tests,test_errors,test_failures,test_execution_time,security_rating,test_success_density,reliability_rating&ps=${pageSize}`);
    } catch (error) {
      console.log('Error in test: ', error);
      throw error;
    }
  });
});
