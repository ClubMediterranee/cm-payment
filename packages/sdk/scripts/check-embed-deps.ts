/**
 * Post-build guard for the portable embed entries (`@clubmed/caps/webcomponent`).
 *
 * - Follows the import graph of `dist/embed/<entry>/index.js` (including shared chunks) and fails on any
 *   bare import other than React (and `@module-federation/runtime` / `bridge-react` for the webcomponent entry),
 *   or on CSS.
 * - Fails when SDK sources portal content to `document.body`, which would escape the CAPS shadow root.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');

const REACT_IMPORTS = ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client'];

const ENTRIES: Record<string, string[]> = {
  'embed/shared/index.js': REACT_IMPORTS,
  'embed/webcomponent/index.js': [
    ...REACT_IMPORTS,
    '@module-federation/runtime',
    '@module-federation/bridge-react/base',
  ],
};

const IMPORT_SPECIFIERS = [
  /\bimport\s+(?:[\w*{}\s,$]+\s+from\s+)?["']([^"']+)["']/g,
  /\bexport\s+(?:\*|{[^}]*})\s+from\s+["']([^"']+)["']/g,
  /\bimport\(\s*["']([^"']+)["']\s*\)/g,
];

function collectImports(code: string): string[] {
  return IMPORT_SPECIFIERS.flatMap((pattern) =>
    [...code.matchAll(pattern)].map(([, spec]) => spec),
  );
}

function checkEntry(entry: string, allowed: string[]): string[] {
  const entryFile = join(dist, entry);

  if (!existsSync(entryFile)) {
    return [`${entry}: missing build output`];
  }

  const errors: string[] = [];
  const visited = new Set<string>();
  const queue = [entryFile];

  while (queue.length) {
    const file = queue.pop()!;

    if (visited.has(file)) {
      continue;
    }

    visited.add(file);

    for (const spec of collectImports(readFileSync(file, 'utf8'))) {
      const where = `${entry} → ${relative(dist, file)}`;

      if (spec.endsWith('.css') || spec.endsWith('.scss')) {
        errors.push(`${where}: imports a stylesheet (${spec})`);
      } else if (spec.startsWith('.')) {
        queue.push(resolve(dirname(file), spec));
      } else if (!allowed.includes(spec)) {
        errors.push(`${where}: forbidden import "${spec}"`);
      }
    }
  }

  return errors;
}

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);

    if (statSync(path).isDirectory()) {
      yield* walk(path);
    } else if (/\.tsx?$/.test(name) && !/\.(spec|stories)\.tsx?$/.test(name)) {
      yield path;
    }
  }
}

function checkPortals(): string[] {
  const errors: string[] = [];

  for (const file of walk(join(root, 'src'))) {
    if (/createPortal\([^;]*document\.body/s.test(readFileSync(file, 'utf8'))) {
      errors.push(
        `${relative(root, file)}: createPortal(…, document.body) escapes the CAPS shadow root`,
      );
    }
  }

  return errors;
}

const errors = [
  ...Object.entries(ENTRIES).flatMap(([entry, allowed]) => checkEntry(entry, allowed)),
  ...checkPortals(),
];

if (errors.length) {
  console.error(`✗ Embed dependency check failed:\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}

console.log('✓ Embed entries only depend on React (and @module-federation for webcomponent)');
