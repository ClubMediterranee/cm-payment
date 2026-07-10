import { paymentRedirectControllerPaymentless } from '../../../__generated__/bff';
import { PaymentProvidersControllerGetPaymentProviders200PaymentProvidersItemAllOfConnectionType as ConnectionType } from '../../../__generated__/bff/index.schemas';
import { getPaymentRedirect } from './getPaymentRedirect';
import { getPaymentRedirectUrl } from './getPaymentRedirectUrl';
import { resolveBooking } from './resolveBooking';

vi.mock('../../../__generated__/bff', () => ({
  paymentRedirectControllerPaymentless: vi.fn(),
}));
vi.mock('./getPaymentRedirectUrl');
vi.mock('./resolveBooking');

const mockPaymentless = vi.mocked(paymentRedirectControllerPaymentless);
const mockGetPaymentRedirectUrl = vi.mocked(getPaymentRedirectUrl);
const mockResolveBooking = vi.mocked(resolveBooking);

const formData = {
  provider_id: 'MANUAL',
  amount: '100',
  currency: 'EUR',
} as any;

describe('getPaymentRedirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveBooking.mockResolvedValue({
      booking_id: 'booking-999',
      customer_id: 'customer-888',
    });
  });

  it('confirms the booking via the paymentless endpoint for manual providers', async () => {
    mockPaymentless.mockResolvedValue({
      url: 'https://confirmation.url?payment_status=OK',
      method: 'GET',
    } as any);

    const result = await getPaymentRedirect(
      formData,
      { type: 'booking', id: 'booking-999', callbackUrlSeller: 'https://seller.callback' },
      { connection_type: ConnectionType.Manual } as any,
    );

    expect(mockPaymentless).toHaveBeenCalledWith({
      callback_url: 'https://seller.callback',
      booking_id: 'booking-999',
      customer_id: 'customer-888',
      provider_id: 'MANUAL',
      amount: '100',
      currency: 'EUR',
    });
    expect(result).toEqual({
      redirect: { url: 'https://confirmation.url?payment_status=OK', method: 'GET' },
      payment: null,
    });
    expect(mockGetPaymentRedirectUrl).not.toHaveBeenCalled();
  });

  it('includes proposal_id for a proposal config', async () => {
    mockPaymentless.mockResolvedValue({ url: 'https://x', method: 'GET' } as any);

    await getPaymentRedirect(
      formData,
      { type: 'proposal', id: 'proposal-123', callbackUrlSeller: 'https://seller.callback' },
      { connection_type: ConnectionType.Manual } as any,
    );

    expect(mockPaymentless).toHaveBeenCalledWith(
      expect.objectContaining({ proposal_id: 'proposal-123' }),
    );
  });

  it('delegates to getPaymentRedirectUrl for non-manual providers', async () => {
    mockGetPaymentRedirectUrl.mockResolvedValue({
      redirect: { url: 'https://psp', method: 'GET' },
    } as any);

    const result = await getPaymentRedirect(formData, { type: 'booking', id: 'booking-999' }, {
      connection_type: ConnectionType['E-commerce'],
      configuration: { display_type: 'redirect' },
    } as any);

    expect(mockGetPaymentRedirectUrl).toHaveBeenCalledWith(
      formData,
      { booking_id: 'booking-999', customer_id: 'customer-888' },
      'redirect',
    );
    expect(result).toEqual({ redirect: { url: 'https://psp', method: 'GET' } });
    expect(mockPaymentless).not.toHaveBeenCalled();
  });
});
