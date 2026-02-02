import { DITest } from '@tsed/di';

import { HealthController } from './HealthController.js';

describe('HealthController', () => {
  afterEach(DITest.reset);

  describe('check()', () => {
    it('should return ok', async () => {
      const controller = await DITest.invoke(HealthController);

      expect(controller.check()).toEqual({
        status: 'OK',
      });
    });
  });
});
