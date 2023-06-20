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

export const bodyCalculateSQCResponse = {
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
