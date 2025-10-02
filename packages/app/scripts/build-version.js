import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import pkg from '../package.json' with { type: 'json' };

const root = join(import.meta.dirname, '..');
const releaseInfoFile = join(root, 'public', 'release.info');
const outputFile = join(root, 'public', 'version.json');

const branch = await readFile(releaseInfoFile, 'utf-8');

await writeFile(
  outputFile,
  JSON.stringify({
    version: pkg.version,
    branch: pkg.version === branch.trim() ? undefined : branch.trim(),
  }),
  'utf-8',
);
