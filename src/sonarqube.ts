export default class Sonarqube {
  private sonarMetrics = [
    'files',
    'functions',
    'complexity',
    'comment_lines_density',
    'duplicated_lines_density',
    'coverage',
    'ncloc',
    'tests',
    'test_errors',
    'test_failures',
    'test_execution_time',
    'security_rating',
    'test_success_density',
    'reliability_rating',
  ]

  constructor() {
  }
}