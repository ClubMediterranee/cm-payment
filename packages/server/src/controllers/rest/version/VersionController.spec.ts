import { PlatformTest } from '@tsed/platform-http/testing';
import { join } from 'path';

import { VersionController } from './VersionController.js';

describe('VersionController', () => {
  beforeEach(() =>
    PlatformTest.create({
      rootDir: join(__dirname, '..', '..', '..', '..'),
      version: '1.0.0',
    }),
  );
  afterEach(() => PlatformTest.reset());
  it('should return version', async () => {
    const controller = PlatformTest.get<VersionController>(VersionController);

    expect(await controller.get()).toEqual({
      branch: 'master',
      version: '1.0.0',
    });
  });
});
