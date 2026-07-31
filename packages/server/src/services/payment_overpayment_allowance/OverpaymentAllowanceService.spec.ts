import { PlatformTest } from '@tsed/platform-http/testing';

import * as api from '../../infra/api/__generated__/index.js';
import { PaymentConfigService } from '../payment_config/PaymentConfigService.js';
import { OidcIssuerTypes } from '../payment_config/types.js';
import { OverpaymentAllowanceService } from './OverpaymentAllowanceService.js';

vi.mock('../../infra/api/__generated__/index.js', async (importOriginal) => ({
  ...(await importOriginal()),
  getV3CustomersCustomerIdBookingsBookingId: vi.fn(),
}));

const makeSettings = (
  overrides: { type?: 'none' | 'percent' | 'amount'; value?: number } = {},
) => ({
  feature_flips: {},
  settings: {
    max_amount_exceedance_type: overrides.type ?? 'none',
    max_amount_exceedance_value: overrides.value ?? 0,
  },
});

describe('OverpaymentAllowanceService', () => {
  let service: OverpaymentAllowanceService;
  let configService: PaymentConfigService;

  beforeEach(async () => {
    await PlatformTest.create({
      DIRECTUS_URL: 'http://localhost',
      DIRECTUS_API_TOKEN: 'test-token',
    });
    service = await PlatformTest.invoke<OverpaymentAllowanceService>(OverpaymentAllowanceService);
    configService = await PlatformTest.get<PaymentConfigService>(PaymentConfigService);
  });

  afterEach(() => {
    PlatformTest.reset();
    vi.clearAllMocks();
  });

  const baseParams = {
    bookingId: 'booking-123',
    customerId: 'customer-456',
    locale: 'fr-CA',
  };

  const mockBooking = (overrides: { sold_by?: string; total_price?: number } = {}) =>
    vi.spyOn(api, 'getV3CustomersCustomerIdBookingsBookingId').mockResolvedValue({
      id: 'booking-123',
      events: [],
      multiple_sale_contracts: false,
      vendor: { sold_by: overrides.sold_by ?? 'PARTNERS' },
      total_price: { amount: overrides.total_price ?? 20000, currency: 'EUR' },
    } as any);

  it('returns 0 for GM (type=none)', async () => {
    vi.spyOn(configService, 'getPaymentConfig').mockResolvedValue(makeSettings());

    const result = await service.getOverpaymentAllowance({
      ...baseParams,
      issuerType: OidcIssuerTypes.GM,
    });

    expect(result.amount).toBe(0);
  });

  it('returns fixed amount for GO (type=amount)', async () => {
    vi.spyOn(configService, 'getPaymentConfig').mockResolvedValue(
      makeSettings({ type: 'amount', value: 100000 }),
    );
    mockBooking();

    const result = await service.getOverpaymentAllowance({
      ...baseParams,
      issuerType: OidcIssuerTypes.GO,
    });

    expect(result.amount).toBe(100000);
  });

  it('returns total_price * percent for PARTNERS with indirect booking', async () => {
    vi.spyOn(configService, 'getPaymentConfig').mockResolvedValue(
      makeSettings({ type: 'percent', value: 0.5 }),
    );
    mockBooking({ total_price: 20000 });

    const result = await service.getOverpaymentAllowance({
      ...baseParams,
      issuerType: OidcIssuerTypes.PARTNERS,
    });

    expect(result.amount).toBe((20000 * 0.5) / 100);
  });

  it('returns 0 for PARTNERS with direct booking (sold_by=CLUBMED)', async () => {
    vi.spyOn(configService, 'getPaymentConfig').mockResolvedValue(
      makeSettings({ type: 'percent', value: 0.5 }),
    );
    mockBooking({ sold_by: 'CLUBMED' });

    const result = await service.getOverpaymentAllowance({
      ...baseParams,
      issuerType: OidcIssuerTypes.PARTNERS,
    });

    expect(result.amount).toBe(0);
  });
});
