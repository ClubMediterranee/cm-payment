import { readFileSync } from 'node:fs';

import { DotEnvsConfigSource } from '@tsed/config/dotenv';

import loggerConfig from './logger/index.js';

const pkg = JSON.parse(readFileSync('./package.json', { encoding: 'utf8' }));
/**
 * This is the shared configuration for the application
 */
export const config: Partial<TsED.Configuration> = {
  version: pkg.version,
  ajv: {
    returnsCoercedValues: true,
  },
  logger: loggerConfig,
  extends: [DotEnvsConfigSource],
};
