module.exports = {
  testMatch: ["**/*.test.ts"],
  coverageDirectory: 'coverage',
  preset: 'ts-jest',
  reporters: [
    'default',
    [
      'jest-sonar',
      {
        outputDirectory: '.',
        outputName: 'coverage.xml'
      }
    ]
  ]
};