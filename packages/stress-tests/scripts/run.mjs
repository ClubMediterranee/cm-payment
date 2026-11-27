#!/usr/bin/env node
// Runs an Artillery scenario after checking the target answers, so a stopped server fails in seconds
// instead of after the whole load profile.
// Usage: node scripts/run.mjs <scenario> [artillery flags...]   (STRESS_ENV=local|docker, or --target <url>)
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [scenario, ...flags] = process.argv.slice(2);
const environment = process.env.STRESS_ENV || 'local';

function readEnvironmentTargets() {
  const yaml = readFileSync(join(root, 'config/environments.yml'), 'utf8');
  return Object.fromEntries(
    [...yaml.matchAll(/^ {4}([\w-]+):\n {6}target: (\S+)$/gm)].map(([, name, url]) => [name, url]),
  );
}

function resolveTarget() {
  const index = flags.findIndex((flag) => flag === '--target' || flag === '-t');
  if (index !== -1) {
    return flags[index + 1];
  }
  const target = readEnvironmentTargets()[environment];
  if (!target) {
    console.error(`Unknown STRESS_ENV "${environment}" (see config/environments.yml).`);
    process.exit(1);
  }
  return target;
}

async function check(url, headers = {}) {
  try {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(10_000) });
    return response.ok ? null : `HTTP ${response.status}`;
  } catch (error) {
    return error.cause?.code ?? error.name ?? String(error);
  }
}

async function preflight(target) {
  const local = /^https?:\/\/localhost[:/]/.test(`${target}/`);
  const server = await check(`${target}/rest/health`);
  if (server) {
    const hint = local
      ? ' Start it with `pnpm --filter @clubmed/server start`.'
      : ' Check the deployment and that this machine reaches the host (proxy).';
    return `the server does not answer on ${target}/rest/health (${server}).${hint}`;
  }
  const directus = await check(`${target}/rest/payment_config`);
  if (directus) {
    const hint = local
      ? ': check DIRECTUS_URL and DIRECTUS_API_TOKEN in packages/server/.env.local.'
      : ': check the Directus the server points to.';
    return `${target}/rest/payment_config fails (${directus})${hint}`;
  }
  return null;
}

// Names the measured build in the log. Not fatal: an older server may not expose the route.
async function deployedVersion(target) {
  try {
    const response = await fetch(`${target}/rest/version`, { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) {
      return `unknown (/rest/version: HTTP ${response.status})`;
    }
    const { version, branch } = await response.json();
    return `${branch ?? '?'} (package ${version ?? '?'})`;
  } catch (error) {
    return `unknown (/rest/version: ${error.cause?.code ?? error.name ?? String(error)})`;
  }
}

if (!scenario) {
  console.error('Usage: node scripts/run.mjs <scenario> [artillery flags...]');
  process.exit(1);
}

const target = resolveTarget();
const failure = await preflight(target);
if (failure) {
  console.error(`Preflight failed: ${failure}`);
  process.exit(1);
}
console.log(`Preflight OK on ${target}, deployed version: ${await deployedVersion(target)}.`);
console.log(`Starting the "${scenario}" scenario.`);

mkdirSync(join(root, 'reports'), { recursive: true });
const child = spawn(
  'artillery',
  [
    'run',
    `scenarios/${scenario}.yml`,
    '--config',
    'config/environments.yml',
    '--environment',
    environment,
    '--output',
    `reports/${scenario}.json`,
    ...flags,
  ],
  { cwd: root, stdio: 'inherit' },
);
child.on('exit', (code) => process.exit(code ?? 1));
