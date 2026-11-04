import { existsSync } from 'node:fs';
import { basename } from 'node:path';

export const MFE_MOUNT_PATH = '/mfe';

/**
 * Entry files are resolved by the Module Federation runtime on each page load: they must never be cached.
 */
const MFE_ENTRY_FILES = ['mf-manifest.json', 'mf-stats.json', 'remoteEntry.js'];

/**
 * Vite / Module Federation chunks carry a content hash (`name-[hash].js`).
 */
const HASHED_FILE = /[-.][A-Za-z0-9_-]{8,}\.(?:js|mjs|css|woff2?|svg|png|jpe?g|webp)$/;

type HeaderWriter = { setHeader(name: string, value: string): unknown };

export function getMfeCacheControl(filePath: string): string {
  const file = basename(filePath);

  if (!MFE_ENTRY_FILES.includes(file) && HASHED_FILE.test(file)) {
    return 'public, max-age=31536000, immutable';
  }

  return 'no-cache';
}

export function setMfeCacheHeaders(res: HeaderWriter, filePath: string) {
  res.setHeader('Cache-Control', getMfeCacheControl(filePath));
}

/**
 * The remote is mandatory in production images; elsewhere (local dev, tests) it is optional.
 */
export function checkMfeRoot(root: string | undefined, isProduction: boolean) {
  if (root && existsSync(root)) {
    return { ok: true as const };
  }

  const message = `CAPS embed remote not found at "${root}". Build it with \`pnpm --filter @clubmed/caps-mfe run build\`.`;

  if (isProduction) {
    throw new Error(message);
  }

  return { ok: false as const, message };
}
