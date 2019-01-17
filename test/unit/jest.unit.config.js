const path = require('path')

module.exports = {
  rootDir: path.resolve(path.join(__dirname, '../..')),
  moduleFileExtensions: ['js', 'json'],
  setupTestFrameworkScriptFile: '<rootDir>/test/unit/td.setup',
  setupFiles: ['<rootDir>/test/unit/test.env.setup'],
  coverageDirectory: '<rootDir>/.test/unit/coverage',
  collectCoverageFrom: ['<rootDir>/src/**/*.js'],
  testPathIgnorePatterns: ['<rootDir>/test/integration'],
  testResultsProcessor: '<rootDir>/test/unit/unit-result-reporter.js'
}
