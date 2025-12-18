export default {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['./src/test/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text', 'text-summary'],

  // Solo buscar archivos de prueba en test/
  testMatch: ['**/test/**/*.test.jsx'],

};