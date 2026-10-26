import { DITest } from '@tsed/di';

import * as oney from '../../infra/oney/__generated__/index.js';
import { PaymentConfigService } from '../payment_config/PaymentConfigService.js';
import { BnplSimulationService } from './BnplSimulationService.js';

vi.mock('../../infra/oney/__generated__/index.js', async (importOriginal) => ({
  ...(await importOriginal()),
  businessTransaction: vi.fn(),
  simulation: vi.fn(),
}));

const buildProvidersConfig = (settings: Record<string, unknown> = {}) => ({
  EHIPAYBNPL: {
    settings: {
      api_key: 'api-key',
      merchant_id: 'merchant-1',
      psp_guid: 'psp-1',
      payment_mode: '3x',
      is_free: 'false',
      ...settings,
    },
  },
});

const invokeService = (providersConfig: unknown) =>
  DITest.invoke<BnplSimulationService>(BnplSimulationService, [
    {
      token: PaymentConfigService,
      use: { getPaymentProvidersConfig: vi.fn().mockResolvedValue(providersConfig) },
    },
  ]);

describe('BnplSimulationService', () => {
  afterEach(async () => {
    await DITest.reset();
    vi.clearAllMocks();
  });

  it('simulates the Oney business transaction matching the configured payment mode', async () => {
    vi.mocked(oney.businessTransaction).mockResolvedValue([
      { short_label: 'Oney 4x', business_transaction_code: 'BT4' },
      { short_label: 'Oney 3X', business_transaction_code: 'BT3' },
    ] as any);
    vi.mocked(oney.simulation).mockResolvedValue({
      total_cost: 5,
      down_payment_amount: 100,
      first_instalment_date: '2026-11-01',
      instalments: [],
    } as any);
    const service = await invokeService(buildProvidersConfig());

    const result = await service.simulate('EHIPAYBNPL', 'fr-FR', { payment_amount: 300 });

    expect(result).toEqual({
      cost: 5,
      instalments: [{ number: 0, amount: 100, date: '2026-11-01' }],
    });
    expect(oney.businessTransaction).toHaveBeenCalledWith(
      {
        merchant_guid: 'merchant-1',
        psp_guid: 'psp-1',
        payment_amount: 300,
        free_business_transaction: false,
      },
      { apiKey: 'api-key', countryCode: 'FR' },
    );
    expect(oney.simulation).toHaveBeenCalledWith(
      {
        payment_amount: 300,
        merchant_guid: 'merchant-1',
        psp_guid: 'psp-1',
        business_transaction_code: 'BT3',
      },
      { apiKey: 'api-key', countryCode: 'FR' },
    );
  });

  it('requests a free business transaction when the provider is configured as free', async () => {
    vi.mocked(oney.businessTransaction).mockResolvedValue([
      { short_label: 'Oney 3x', business_transaction_code: 'BT3' },
    ] as any);
    vi.mocked(oney.simulation).mockResolvedValue({
      total_cost: 0,
      down_payment_amount: 100,
      first_instalment_date: '2026-11-01',
    } as any);
    const service = await invokeService(buildProvidersConfig({ is_free: 'true' }));

    await service.simulate('EHIPAYBNPL', 'fr-FR', { payment_amount: 300 });

    expect(oney.businessTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ free_business_transaction: true }),
      expect.anything(),
    );
  });

  it('throws when no business transaction matches the payment mode', async () => {
    vi.mocked(oney.businessTransaction).mockResolvedValue([
      { short_label: 'Oney 4x', business_transaction_code: 'BT4' },
    ] as any);
    const service = await invokeService(buildProvidersConfig());

    await expect(service.simulate('EHIPAYBNPL', 'fr-FR', { payment_amount: 300 })).rejects.toThrow(
      'Simulation unavailable for payment mode "3x"',
    );
    expect(oney.simulation).not.toHaveBeenCalled();
  });

  it('throws when Oney returns no business transaction', async () => {
    vi.mocked(oney.businessTransaction).mockResolvedValue(undefined as any);
    const service = await invokeService(buildProvidersConfig());

    await expect(service.simulate('EHIPAYBNPL', 'fr-FR', { payment_amount: 300 })).rejects.toThrow(
      'Simulation unavailable',
    );
  });
});
