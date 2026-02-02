import { PlatformTest } from '@tsed/platform-http/testing';
import { join } from 'path';

import { VersionCtrl } from './VersionCtrl.js';

describe('VersionCtrl', () => {
  beforeEach(() =>
    PlatformTest.create({
      rootDir: join(__dirname, '..', '..', '..'),
      version: '1.0.0',
    }),
  );
  afterEach(() => PlatformTest.reset());
  it('should return version', async () => {
    const controller = PlatformTest.get<VersionCtrl>(VersionCtrl);

    expect(await controller.get()).toEqual({
      branch: 'master',
      version: '1.0.0',
    });
  });
});
