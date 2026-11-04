#!/usr/bin/env tsx

import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const getEnv = () => {
  const envArg = process.argv.find((arg) => arg.startsWith('--env='));
  return envArg ? envArg.split('=')[1] : 'development';
};

const env = getEnv();
const CONFIG_DIR = join(process.cwd(), 'packages/app/config');
const ENV_FILE = join(CONFIG_DIR, '.env.local');
let cloudflared: ReturnType<typeof spawn> | null = null;
let app: ReturnType<typeof spawn> | null = null;

const cleanup = () => {
  cloudflared?.kill();
  app?.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

async function getTunnelUrl(): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudflared = spawn(
      'cloudflared',
      ['tunnel', '--url', 'https://localhost:4003', '--no-tls-verify'],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    const onOutput = (data: Buffer) => {
      const match = data.toString().match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (match) resolve(match[0]);
    };

    cloudflared.stdout?.on('data', onOutput);
    cloudflared.stderr?.on('data', onOutput);
    cloudflared.on('error', reject);

    setTimeout(() => reject(new Error('Timeout tunnel')), 15000);
  });
}

async function main() {
  const url = await getTunnelUrl();

  if (env !== 'development') {
    const envFilePath = join(CONFIG_DIR, `.env.${env}`);
    try {
      writeFileSync(ENV_FILE, readFileSync(envFilePath, 'utf-8'));
    } catch {
      console.warn(`\x1b[33m⚠\x1b[0m  Fichier .env.${env} non trouvé\n`);
    }
  }

  console.log(`\n\x1b[1m\x1b[32mURL PUBLIQUE:\x1b[0m \x1b[1m${url}\x1b[0m\n`);
  console.log(`\x1b[90mEnvironnement: ${env}\x1b[0m\n`);

  app = spawn('pnpm', ['--filter', 'app', 'run', 'dev', '--mode', env], {
    stdio: ['ignore', 'inherit', 'inherit'],
    shell: true,
  });

  app.on('exit', cleanup);
}

main().catch((err) => {
  console.error(`\x1b[31m✗\x1b[0m ${err.message}`);
  cleanup();
});
