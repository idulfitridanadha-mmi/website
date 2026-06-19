import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Jalur ke aplikasi Next.js untuk memuat next.config.js dan file .env
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/actions/hewan.ts',
    'app/actions/pengqurban.ts',
    'app/actions/permohonan-online.ts',
    'app/actions/petugas.ts',
    'app/api/track/route.ts',
    'app/utils/tracking.ts',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/app/lib/',
  ],
}

export default createJestConfig(config)