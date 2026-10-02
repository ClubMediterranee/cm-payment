import type { AllowedOrigin, EmbedMode } from './models.js';

export const EMBED_MODES: EmbedMode[] = ['webcomponent', 'iframe'];

/**
 * Normalize an origin (`protocol://host[:port]`, lower-case, no path nor trailing slash).
 * Returns `undefined` when the value is not a valid origin.
 */
export function normalizeOrigin(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined;
  }

  try {
    const url = new URL(value.trim());

    if (!['https:', 'http:'].includes(url.protocol) || url.origin === 'null') {
      return undefined;
    }

    if (url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
      return undefined;
    }

    return url.origin.toLowerCase();
  } catch {
    return undefined;
  }
}

/**
 * Parse the `CAPS_ALLOWED_ORIGINS` environment variable (comma-separated). Invalid entries are dropped.
 * Environment origins apply to every embed mode.
 */
export function parseOriginList(value: string | undefined): AllowedOrigin[] {
  return (value || '')
    .split(',')
    .map(normalizeOrigin)
    .filter((origin): origin is string => !!origin)
    .map((origin) => ({ origin, modes: [...EMBED_MODES] }));
}

/**
 * Merge origin entries by origin, uniting their modes, then split them by embed mode.
 */
export function groupOriginsByMode(entries: AllowedOrigin[]): Record<EmbedMode, string[]> {
  const byOrigin = new Map<string, Set<EmbedMode>>();

  entries.forEach(({ origin, modes }) => {
    const current = byOrigin.get(origin) || new Set<EmbedMode>();
    modes.forEach((mode) => current.add(mode));
    byOrigin.set(origin, current);
  });

  return Object.fromEntries(
    EMBED_MODES.map((mode) => [
      mode,
      [...byOrigin.entries()].filter(([, modes]) => modes.has(mode)).map(([origin]) => origin),
    ]),
  ) as Record<EmbedMode, string[]>;
}
