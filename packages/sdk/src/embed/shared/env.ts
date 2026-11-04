import type { CapsEnv, CapsEnvSelector } from './types';

export const CAPS_ENV_URLS: Readonly<Record<CapsEnv, string>> = Object.freeze({
  production: 'https://caps.api.clubmed',
  staging: 'https://staging.caps.api.clubmed',
  integration: 'https://integration.caps.api.clubmed',
});

export const DEFAULT_CAPS_ENV: CapsEnv = 'production';

const DEFAULT_LOCALE = 'fr-FR';

const LOCALE_FORMAT = /^[a-z]{2}-[A-Z]{2}$/;

export const getDefaultLocale = (): string => {
  const language = typeof navigator !== 'undefined' ? navigator.language : undefined;

  return language && LOCALE_FORMAT.test(language) ? language : DEFAULT_LOCALE;
};

const stripTrailingSlashes = (url: string) => url.replace(/\/+$/, '');

/**
 * Resolve the CAPS server URL. An explicit `url` takes precedence over `env`.
 */
export function resolveCapsUrl({ env = DEFAULT_CAPS_ENV, url }: CapsEnvSelector = {}): string {
  if (url) {
    return stripTrailingSlashes(url);
  }

  if (!Object.prototype.hasOwnProperty.call(CAPS_ENV_URLS, env)) {
    throw new Error(
      `[CAPS] Unknown environment "${env}". Expected one of: ${Object.keys(CAPS_ENV_URLS).join(', ')}.`,
    );
  }

  return CAPS_ENV_URLS[env];
}
