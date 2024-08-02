import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

export interface Organization {
  id: number
  url: string
  name: string
  key: string
  description: string
  products: Array<string>
  actions: unknown
}

export interface Product {
  id: number
  url: string
  name: string
  key: string
  organization: string
  description: string
  repositories: Array<string>
  actions: unknown
}

export interface Repository {
  id: number
  url: string
  name: string
  key: string
  description: string
  product: string
  latest_values: unknown
  historical_values: unknown
  actions: unknown
}

export interface ResponseListRepositories {
  count: number
  next: string | null
  previous: string | null
  results: Array<Repository>
}

export interface ResponseListProducts {
  count: number
  next: string | null
  previous: string | null
  results: Array<Product>
}

export interface ResponseListReleases {
  id: number
  release_name: string
  start_at: string
  end_at: string
  created_by: number
}

export interface ResponseListOrganizations {
  count: number
  next: string | null
  previous: string | null
  results: Array<Organization>
}

export interface ResponseCalculateCharacteristics {
  id: number
  key: string
  name: string
  description: string
  latest: {
    id: number
    value: number
    created_at: string
    characteristic_id: number
  }
}

export interface ResponseCalculateSubcharacteristics {
  id: number
  key: string
  name: string
  description: string
  latest: {
    id: number
    value: number
    created_at: string
    subcharacteristic_id: number
  }
}

export interface ResponseCalculateMeasures {
  id: number
  key: string
  name: string
  description: string
  latest: {
    id: number
    value: number
    created_at: string
    measure_id: number
  }
}

export interface ResponseCalculateTSQMI {
  id: number
  value: number
  created_at: string
}

export class RequestService {
  private MSGRAM_SERVICE_HOST = 'https://epsmsg.shop'
  private MSG_TOKEN = "'secret';"
  private baseUrl = `${this.MSGRAM_SERVICE_HOST}/api/v1/`

  public getBaseUrl(): string {
    return this.baseUrl
  }

  public getMsgToken(): string {
    return this.MSG_TOKEN
  }

  public setMsgToken(token: string): void {
    this.MSG_TOKEN = token
  }

  private async makeRequest(method: 'get' | 'post', url: string, data: object = {}): Promise<AxiosResponse | null> {
    console.log('URL REQUES ', url, ' method: ', method, ' data', data)
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.MSG_TOKEN,
      },
      method,
      url,
      data,
    }

    console.log('request body', data)

    axios.defaults.timeout = 50000 // await for heroku to wake up

    let response: AxiosResponse | null = null
    try {
      response = await axios(config)
      console.log(`Data ${method === 'get' ? 'received' : 'sent'}. Status code: ${response?.status}`)
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError
        console.error(
          `Failed to ${method} data to the API. ${axiosError.message} at route ${config.url}, ${axiosError.response?.data}`
        )
      } else {
        console.error('An unexpected error occurred.')
      }
    }
    return response
  }

  public async listOrganizations(): Promise<ResponseListOrganizations> {
    const url = `${this.baseUrl}organizations/`
    const response = await this.makeRequest('get', url)
    if (response?.data) {
      console.log(`Data received. Status code: ${response.status}`)
      return response?.data
    } else {
      throw new Error('No data received from the API.')
    }
  }

  public async listProducts(orgId: number): Promise<ResponseListProducts> {
    const url = `${this.baseUrl}organizations/${orgId}/products/`
    const response = await this.makeRequest('get', url)
    return response?.data
  }

  public async listRepositories(orgId: number, productId: number): Promise<ResponseListRepositories> {
    const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/`
    const response = await this.makeRequest('get', url)
    if (response) {
      console.log(`Data received. Status code: ${response.status}`)
      return response?.data
    } else {
      throw new Error('No data received from the API.')
    }
  }

  public async listReleases(orgId: number, productId: number): Promise<ResponseListReleases[]> {
    const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/release/all`
    const response = await this.makeRequest('get', url)
    if (response?.data) {
      console.log(`Data received. Status code: ${response.status}`)
      return response?.data.results
    } else {
      throw new Error('No data received from the API.')
    }
  }

  public async insertMetrics(metrics: string, orgId: number, productId: number, repoId: number): Promise<undefined> {
    const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/collectors/sonarqube/`
    const jsonData = JSON.parse(metrics)
    const response = await this.makeRequest('post', url, jsonData)
    return response?.data
  }

  public async insertGithubMetrics(
    metrics: Record<string, any>,
    orgId: number,
    productId: number,
    repoId: number
  ): Promise<null> {
    const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/collectors/github/`
    await this.makeRequest('post', url, metrics)
    return null
  }

  public async calculateMeasures(
    orgId: number,
    productId: number,
    repoId: number
  ): Promise<ResponseCalculateMeasures[]> {
    const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/measures/`
    const data = {
      measures: [
        // { key: 'passed_tests' },
        // { key: 'test_builds' },
        // { key: 'test_coverage' },
        // { key: 'non_complex_file_density' },
        // { key: 'commented_file_density' },
        // { key: 'duplication_absense' },
        { key: 'team_throughput' },
        { key: 'ci_feedback_time' },
      ],
    }
    const response = await this.makeRequest('post', url, data)

    return response?.data
  }

  public async calculateCharacteristics(
    orgId: number,
    productId: number,
    repoId: number
  ): Promise<ResponseCalculateCharacteristics[]> {
    const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/characteristics/`
    const data = {
      characteristics: [{ key: 'reliability' }, { key: 'maintainability' }, { key: 'functional_suitability' }],
    }
    const response = await this.makeRequest('post', url, data)
    return response?.data
  }

  public async calculateSubCharacteristics(
    orgId: number,
    productId: number,
    repoId: number
  ): Promise<ResponseCalculateSubcharacteristics[]> {
    const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/subcharacteristics/`
    const data = {
      subcharacteristics: [{ key: 'modifiability' }, { key: 'testing_status' }, { key: 'functional_completeness' }],
    }
    const response = await this.makeRequest('post', url, data)
    return response?.data
  }

  public async calculateTSQMI(orgId: number, productId: number, repoId: number): Promise<ResponseCalculateTSQMI> {
    const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/tsqmi/`
    const response = await this.makeRequest('post', url)
    return response?.data
  }
}
