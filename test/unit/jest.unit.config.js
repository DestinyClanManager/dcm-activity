const path = require('path')

module.exports = {
  rootDir: path.resolve(path.join(__dirname, '../..')),
  moduleFileExtensions: ['js', 'json'],
  setupFiles: ['<rootDir>/test/unit/test.env.setup'],
  setupFilesAfterEnv: ['<rootDir>/test/unit/td.setup'],
  coverageDirectory: '<rootDir>/.test/unit/coverage',
  collectCoverageFrom: ['<rootDir>/src/**/*.js'],
  testPathIgnorePatterns: ['<rootDir>/test/integration'],
  testResultsProcessor: '<rootDir>/test/unit/unit-result-reporter.js'
}
