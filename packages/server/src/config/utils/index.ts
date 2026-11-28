import dotenv from 'dotenv-flow';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

export const config = dotenv.config();
export const isProduction = process.env.NODE_ENV === 'production';
/** integration, staging or production on the deployed servers, `local` otherwise (also when set to empty). */
export const APP_ENV_LEVEL = process.env.APP_ENV_LEVEL || 'local';

/**
 * Timeout of the outgoing calls (HTTP client and `/api` proxy), below the 30 s origin timeout of CloudFront so a slow
 * upstream fails with a 504 from the server instead of a CloudFront error while the call keeps running.
 */
export const DEFAULT_HTTP_CLIENT_TIMEOUT_MS = 8000;
export const HTTP_CLIENT_TIMEOUT_MS =
  Number(process.env.HTTP_CLIENT_TIMEOUT_MS) || DEFAULT_HTTP_CLIENT_TIMEOUT_MS;

export const envs = {
  ...process.env,
  APP_ENV_LEVEL,
  HTTP_CLIENT_TIMEOUT_MS,
};
