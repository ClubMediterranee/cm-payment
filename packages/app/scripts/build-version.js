import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import pkg from '../package.json' with { type: 'json' };

const root = join(import.meta.dirname, '..');
const releaseInfoFile = join(root, 'public', 'release.info');
const outputFile = join(root, 'dist', 'version.json');

const branch = await readFile(releaseInfoFile, 'utf-8');

console.log('Generating version.json file...');
console.log('Build version:', pkg.version, branch.trim());

await writeFile(
  outputFile,
  JSON.stringify({
    version: pkg.version,
    branch: pkg.version === branch.trim() ? undefined : branch.trim(),
  }),
  'utf-8',
);

console.log('version.json file generated at', outputFile);
