import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  // Undoes every jest.spyOn after each test, even one that failed midway
  restoreMocks: true,
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: './tsconfig.json',
    }],
  },
  testMatch: ['**/*.test.ts?(x)'],
  // Other checkouts of this repository live here, and their tests are not
  // this one's. Anchored to rootDir so a checkout inside it still runs its own.
  testPathIgnorePatterns: ['<rootDir>/.claude/worktrees/'],
  modulePathIgnorePatterns: ['<rootDir>/.claude/worktrees/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Only in CI, where the test step's own run produces the report Codecov gets
  collectCoverage: !!process.env.CI,
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}', '!src/**/*.d.ts'],
  coverageReporters: ['lcov', 'text-summary'],
}

export default createJestConfig(config) 