import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { PlatformTest } from '@tsed/platform-http/testing';

import { VersionController } from './VersionController.js';

describe('VersionController', () => {
  let rootDir: string;

  beforeEach(() => {
    rootDir = mkdtempSync(join(tmpdir(), 'version-controller-'));
    mkdirSync(join(rootDir, 'resources'));
    writeFileSync(join(rootDir, 'resources', 'release.info'), 'develop\n');

    return PlatformTest.create({ rootDir, version: '1.0.0' });
  });
  afterEach(async () => {
    await PlatformTest.reset();
    rmSync(rootDir, { recursive: true, force: true });
  });
  it('should return version', async () => {
    const controller = PlatformTest.get<VersionController>(VersionController);

    expect(await controller.get()).toEqual({
      branch: 'develop',
      version: '1.0.0',
    });
  });
});
