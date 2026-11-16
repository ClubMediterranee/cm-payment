import { PlatformTest } from '@tsed/platform-http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PaymentConfigService } from '../../../services/payment_config/PaymentConfigService.js';
import { PaymentContentController } from './PaymentContentController.js';

describe('PaymentContentController', () => {
  let controller: PaymentContentController;
  let service: PaymentConfigService;

  beforeEach(async () => {
    await PlatformTest.create({
      DIRECTUS_URL: 'http://localhost',
      DIRECTUS_API_TOKEN: 'test-token',
    });

    controller = await PlatformTest.invoke<PaymentContentController>(PaymentContentController);
    service = await PlatformTest.get<PaymentConfigService>(PaymentConfigService);
  });

  afterEach(() => PlatformTest.reset());

  it('should delegate to the service with the locale', async () => {
    const content = { cgv: { heading: 'CGV' } };
    vi.spyOn(service, 'getContent').mockResolvedValue(content);

    const result = await controller.getPaymentContent('fr-FR');

    expect(result).toEqual(content);
    expect(service.getContent).toHaveBeenCalledWith('fr-FR');
  });
});
