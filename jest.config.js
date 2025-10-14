module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'termux-projects/system/**/*.js',
    'termux-projects/config/**/*.js',
    '!termux-projects/system/enhanced-health-check.js'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js'
  ]
};