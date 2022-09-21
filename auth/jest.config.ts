import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  displayName: 'Auth service testing',
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./src/tests/setup.ts'],
};

export default config;
