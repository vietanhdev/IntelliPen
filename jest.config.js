module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/e2e/**/*.test.js'],
  testTimeout: 60000,
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.js'],
  verbose: true,
  collectCoverage: false,
  maxWorkers: 1, // Run tests serially to avoid browser conflicts
};
