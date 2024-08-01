import { GithubMetricsResponse } from "../../src/github";
import { ResponseListOrganizations, ResponseListProducts, ResponseListReleases, ResponseListRepositories } from "../../src/service/request-service";
import { MetricsResponseAPI } from "../../src/sonarqube";

export const bodyCalculateCharacteristicsResponse = [
  {
    id: 1,
    key: 'reliability',
    name: 'Reliability',
    description: null,
    latest: {
      id: 5,
      characteristic_id: 1,
      value: 0.9254618113429579,
      created_at: '2023-06-20T08:03:55.249528-03:00',
    },
  },
];

export const bodyCalculateSubcharacteristicsResponse = [
  {
    "id": 1,
    "key": "reliability",
    "name": "Reliability",
    "description": null,
    "latest": {
      "id": 5,
      "subcharacteristic_id": 1,
      "value": 0.7356028917913602,
      "created_at": "2023-06-20T08:03:55.249528-03:00"
    }
  },
]

export const bodyCalculateTSQMIResponse = {
  id: 2,
  value: 0.8359399436161667,
  created_at: '2023-06-20T08:04:24.045715-03:00',
};

export const bodyCalculateMeasuresResponse = [
  {
    "id": 1,
    "key": "passed_tests",
    "name": "Passed Tests",
    "description": null,
    "latest": {
      "id": 31,
      "measure_id": 1,
      "value": 1.0,
      "created_at": "2023-06-20T08:00:40.248839-03:00"
    }
  },
  {
    "id": 2,
    "key": "test_builds",
    "name": "Test Builds",
    "description": null,
    "latest": {
      "id": 32,
      "measure_id": 2,
      "value": 0.9999999129629629,
      "created_at": "2023-06-20T08:00:40.248839-03:00"
    }
  },
]

export const bodyInsertMetricsResponse = [
  {
    "id": 396,
    "metric_id": 104,
    "value": 28.0,
    "created_at": "2023-06-20T08:00:37.481456-03:00"
  },
  {
    "id": 397,
    "metric_id": 102,
    "value": 0.0,
    "created_at": "2023-06-20T08:00:37.481483-03:00"
  },
]

export const bodyListOrganizationsResponse: ResponseListOrganizations = {
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "url": "http://127.0.0.1:8080/api/v1/organizations/1/",
      "name": "fga-eps-mds",
      "key": "fga-eps-mds",
      "description": "Organização da empresa Pagar-me",
      "products": [
        "http://127.0.0.1:8080/api/v1/organizations/1/products/1/",
        "http://127.0.0.1:8080/api/v1/organizations/1/products/2/"
      ],
      "actions": {
        "create a new product": "http://127.0.0.1:8080/api/v1/organizations/1/products/"
      }
    },
    {
      "id": 2,
      "url": "http://127.0.0.1:8080/api/v1/organizations/2/",
      "name": "fga-eps-mds2",
      "key": "fga-eps-mds2",
      "description": "Organização da empresa Pagar-me",
      "products": [],
      "actions": {
        "create a new product": "http://127.0.0.1:8080/api/v1/organizations/2/products/"
      }
    }
  ]
}

export const bodyListProductsResponse: ResponseListProducts = {
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 2,
      "url": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/",
      "name": "MeasureSoftGram2",
      "key": "fga-eps-mds-measuresoftgram2",
      "organization": "http://127.0.0.1:8080/api/v1/organizations/1/",
      "description": "Sistema de geração de filmes aleatórios",
      "repositories": [
        "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/4/"
      ],
      "actions": {
        "create a new repository": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/",
        "get current goal": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/current/goal/",
        "get compare all goals": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/all/goal/",
        "get current pre-config": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/current/pre-config/",
        "get pre-config entity relationship tree": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/entity-relationship-tree/",
        "get all repositories latest sqcs": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories-sqc-latest-values/",
        "get all repositories sqc historical values": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories-sqc-historical-values/",
        "create a new goal": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/create/goal/",
        "create a new pre-config": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/create/pre-config/"
      }
    },
    {
      "id": 1,
      "url": "http://127.0.0.1:8080/api/v1/organizations/1/products/1/",
      "name": "MeasureSoftGram",
      "key": "fga-eps-mds-measuresoftgram",
      "organization": "http://127.0.0.1:8080/api/v1/organizations/1/",
      "description": "Sistema de geração de filmes aleatórios",
      "repositories": [
        "http://127.0.0.1:8080/api/v1/organizations/1/products/1/repositories/2/",
        "http://127.0.0.1:8080/api/v1/organizations/1/products/1/repositories/3/"
      ],
      "actions": {
        "create a new repository": "http://127.0.0.1:8080/api/v1/organizations/1/products/1/repositories/",
        "get current goal": "http://127.0.0.1:8080/api/v1/organizations/1/products/1/current/goal/",
        "get compare all goals": "http://127.0.0.1:8080/api/v1/organizations/1/products/1/all/goal/",
        "get current pre-config": "http://127.0.0.1:8080/api/v1/organizations/1/products/1/current/pre-config/",
        "get pre-config entity relationship tree": "http://127.0.0.1:8080/api/v1/organizations/1/products/1/entity-relationship-tree/",
        "get all repositories latest sqcs": "http://127.0.0.1:8080/api/v1/organizations/1/products/1/repositories-sqc-latest-values/",
        "get all repositories sqc historical values": "http://127.0.0.1:8080/api/v1/organizations/1/products/1/repositories-sqc-historical-values/",
        "create a new goal": "http://127.0.0.1:8080/api/v1/organizations/1/products/1/create/goal/",
        "create a new pre-config": "http://127.0.0.1:8080/api/v1/organizations/1/products/1/create/pre-config/"
      }
    }
  ]
}

export const bodyListRepositoriesResponse: ResponseListRepositories = {
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 4,
      "url": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/4/",
      "name": "2023-1-MeasureSoftGram-Action",
      "key": "fga-eps-mds-measuresoftgram2-2023-1-measuresoftgram-action",
      "description": "Action customizada do MeasureSoftGram",
      "product": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/",
      "latest_values": {
        "metrics": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/4/latest-values/metrics/",
        "measures": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/4/latest-values/measures/",
        "subcharacteristics": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/4/latest-values/subcharacteristics/",
        "characteristics": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/4/latest-values/characteristics/",
        "sqc": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/4/latest-values/sqc/"
      },
      "historical_values": {
        "metrics": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/4/historical-values/metrics/",
        "measures": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/4/historical-values/measures/",
        "subcharacteristics": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/4/historical-values/subcharacteristics/",
        "characteristics": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/4/historical-values/characteristics/",
        "sqc": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/4/historical-values/sqc/"
      },
      "actions": {
        "collect metric": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/4/collect/metrics/",
        "calculate measures": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/4/calculate/measures/",
        "calculate subcharacteristics": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/4/calculate/subcharacteristics/",
        "calculate characteristics": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/4/calculate/characteristics/",
        "calculate sqc": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/4/calculate/sqc/",
        "import metrics from github": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/4/collectors/github/",
        "import metrics from SonarQube JSON": "http://127.0.0.1:8080/api/v1/organizations/1/products/2/repositories/4/collectors/sonarqube/"
      }
    }
  ]
}

export const bodySonarCloudResponseMetrics: MetricsResponseAPI = {
  "paging": {
    "pageIndex": 1,
    "pageSize": 500,
    "total": 8
  },
  "baseComponent": {
    "id": "AYiFLSWpxvbjbvvU3Hz1",
    "key": "fga-eps-mds_2023-1-MeasureSoftGram-Action",
    "name": "2023-1-MeasureSoftGram-Action",
    "qualifier": "TRK",
    "measures": [
      {
        "metric": "test_success_density",
        "value": "100.0",
        "bestValue": true
      }
    ]
  },
  "components": [
    {
      "id": "AYiK5-7_obxZ9Uuo9t98",
      "key": "fga-eps-mds_2023-1-MeasureSoftGram-Action:__tests__",
      "name": "__tests__",
      "qualifier": "DIR",
      "path": "__tests__",
      "measures": [
        {
          "metric": "test_execution_time",
          "value": "28"
        },
        {
          "metric": "test_failures",
          "value": "0",
          "bestValue": true
        },
        {
          "metric": "test_errors",
          "value": "0",
          "bestValue": true
        },
        {
          "metric": "security_rating",
          "value": "1.0",
          "bestValue": true
        },
        {
          "metric": "tests",
          "value": "11"
        },
        {
          "metric": "reliability_rating",
          "value": "1.0",
          "bestValue": true
        },
        {
          "metric": "test_success_density",
          "value": "100.0",
          "bestValue": true
        }
      ],
      "language": "ts"
    }]
}

export const githubMetricsAPIResponse: GithubMetricsResponse = {
  metrics: [
    {
      name: 'ci_feedback_time',
      value: 350,
      path: 'owner/repo'
    }
  ]
}

export const githubMetricsAPIThroughput: GithubMetricsResponse = {
  metrics: [
    {
      name: 'total_issues', 
      value: 2, 
      path: "testOwner/testRepo"
    }, 
    {
      name: 'resolved_issues', 
      value: 1, 
      path: "testOwner/testRepo"
    }
  ]
}

export const bodyListReleaseResponse: ResponseListReleases[] = [
  {
      "id": 1,
      "release_name": "Release 1",
      "start_at": "2023-06-19T00:00:00-03:00",
      "created_by": 2,
      "end_at": "2023-06-26T00:00:00-03:00"
  }
]