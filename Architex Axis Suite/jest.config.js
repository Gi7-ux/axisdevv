/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    // Handle CSS imports (if any - not strictly needed for current tests but good practice)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle path aliases
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
};
