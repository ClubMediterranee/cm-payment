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
 */
export function parseOriginList(value: string | undefined): string[] {
  return (value || '')
    .split(',')
    .map(normalizeOrigin)
    .filter((origin): origin is string => !!origin);
}
