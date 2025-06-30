// jest.config.js
export default {
  testEnvironment: 'node',
  transform: {},
  verbose: true,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*)/)'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js'
  ]
};
