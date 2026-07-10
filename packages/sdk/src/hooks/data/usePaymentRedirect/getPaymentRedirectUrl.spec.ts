import { postV0PaymentsPaymentIdRedirectRequest, postV1Payments } from '../../../__generated__';
import { Action } from '../../../__generated__/index.schemas';
import { getPaymentRedirectUrl } from './getPaymentRedirectUrl';

vi.mock('../../../__generated__', async () => {
  const actual = await vi.importActual('../../../__generated__');
  return {
    ...actual,
    postV1Payments: vi.fn(),
    postV0PaymentsPaymentIdRedirectRequest: vi.fn(),
  };
});

vi.mock('../../../utils/url/getRedirectPaymentCallbackUrls', () => ({
  getRedirectPaymentCallbackUrls: vi.fn(() => ({
    callback_url: 'https://callback.url/payment',
  })),
}));

const mockPostV1Payments = vi.mocked(postV1Payments);
const mockPostV0PaymentsPaymentIdRedirectRequest = vi.mocked(
  postV0PaymentsPaymentIdRedirectRequest,
);

describe('getPaymentRedirectUrl', () => {
  const mockFormData = {
    currency: 'EUR',
    action: Action.PAYMENT_OPTION,
    amount: '1000',
    provider_id: 'provider-123',
    template_id: 'template-456',
    billing_details: {
      email: 'test@example.com',
      attendee: {
        first_name: 'John',
        last_name: 'Doe',
      },
      address: {
        street: '123 Main St',
        city: 'Paris',
        zip_code: '75001',
        state_or_district: 'Île-de-France',
        country_code: 'FR',
      },
    },
    token: undefined,
  };

  const booking = { booking_id: 'booking-999', customer_id: 'customer-888' };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should create a payment and request the PSP redirect', async () => {
    mockPostV1Payments.mockResolvedValue({ id: 'payment-123' } as any);
    mockPostV0PaymentsPaymentIdRedirectRequest.mockResolvedValue({
      url: 'https://payment.gateway.com',
      body: 'param1=value1&param2=value2',
    } as any);

    const result = await getPaymentRedirectUrl(mockFormData as any, booking);

    expect(mockPostV1Payments).toHaveBeenCalledWith({
      booking_id: 'booking-999',
      customer_id: 'customer-888',
      currency: 'EUR',
      action: Action.PAYMENT_OPTION,
      amount: 1000,
      provider_id: 'provider-123',
    });
    expect(mockPostV0PaymentsPaymentIdRedirectRequest).toHaveBeenCalledWith('payment-123', {
      callback_url: 'https://callback.url/payment',
      payment_condition_id: undefined,
      template_id: 'template-456',
      billing_details: {
        email: 'test@example.com',
        mobile_phone: undefined,
        first_name: 'John',
        last_name: 'Doe',
        address1: '123 Main St',
        locality: 'Paris',
        postal_code: '75001',
        administrative_area: 'Île-de-France',
        country_code: 'FR',
      },
      token: undefined,
    });
    expect(result).toEqual({
      redirect: {
        url: 'https://payment.gateway.com',
        body: 'param1=value1&param2=value2',
      },
      payment: {
        paymentId: 'payment-123',
        callbacks: { callback_url: 'https://callback.url/payment' },
      },
    });
  });

  it('should throw error when redirect URL is empty', async () => {
    mockPostV1Payments.mockResolvedValue({ id: 'payment-789' } as any);
    mockPostV0PaymentsPaymentIdRedirectRequest.mockResolvedValue({ url: '', body: '' } as any);

    await expect(getPaymentRedirectUrl(mockFormData as any, booking)).rejects.toThrow(
      'Payment redirect URL not found',
    );
  });

  it('should throw error when redirect URL is undefined', async () => {
    mockPostV1Payments.mockResolvedValue({ id: 'payment-999' } as any);
    mockPostV0PaymentsPaymentIdRedirectRequest.mockResolvedValue({
      url: undefined,
      body: 'some-body',
    } as any);

    await expect(getPaymentRedirectUrl(mockFormData as any, booking)).rejects.toThrow(
      'Payment redirect URL not found',
    );
  });

  it('should handle null callback url', async () => {
    const { getRedirectPaymentCallbackUrls } =
      await import('../../../utils/url/getRedirectPaymentCallbackUrls');
    vi.mocked(getRedirectPaymentCallbackUrls).mockReturnValueOnce({ callback_url: '' } as any);

    mockPostV1Payments.mockResolvedValue({ id: 'payment-555' } as any);
    mockPostV0PaymentsPaymentIdRedirectRequest.mockResolvedValue({
      url: 'https://final.url',
      body: 'final=body',
    } as any);

    const result = await getPaymentRedirectUrl(mockFormData as any, booking);

    expect(mockPostV0PaymentsPaymentIdRedirectRequest).toHaveBeenCalledWith('payment-555', {
      callback_url: '',
      payment_condition_id: undefined,
      template_id: 'template-456',
      billing_details: {
        email: 'test@example.com',
        mobile_phone: undefined,
        first_name: 'John',
        last_name: 'Doe',
        address1: '123 Main St',
        locality: 'Paris',
        postal_code: '75001',
        administrative_area: 'Île-de-France',
        country_code: 'FR',
      },
      token: undefined,
    });
    expect(result).toEqual({
      redirect: { url: 'https://final.url', body: 'final=body' },
      payment: { paymentId: 'payment-555', callbacks: { callback_url: '' } },
    });
  });

  it('should handle callback_url_seller for GO/PARTNERS', async () => {
    const { getRedirectPaymentCallbackUrls } =
      await import('../../../utils/url/getRedirectPaymentCallbackUrls');
    vi.mocked(getRedirectPaymentCallbackUrls).mockReturnValueOnce({
      callback_url: 'https://callback.url/client',
      callback_url_seller: 'https://callback.url/seller',
    } as any);

    mockPostV1Payments.mockResolvedValue({ id: 'payment-999' } as any);
    mockPostV0PaymentsPaymentIdRedirectRequest.mockResolvedValue({
      url: 'https://redirect.url',
      body: 'data=test',
    } as any);

    const result = await getPaymentRedirectUrl(mockFormData as any, booking);

    expect(result).toEqual({
      redirect: { url: 'https://redirect.url', body: 'data=test' },
      payment: {
        paymentId: 'payment-999',
        callbacks: {
          callback_url: 'https://callback.url/client',
          callback_url_seller: 'https://callback.url/seller',
        },
      },
    });
  });

  it('should map billing address combining number and street', async () => {
    const formDataWithNumberAndStreet = {
      ...mockFormData,
      billing_details: {
        email: 'test@example.com',
        address: { number: '42', street: 'Elm Street' },
      },
    };

    mockPostV1Payments.mockResolvedValue({ id: 'payment-777' } as any);
    mockPostV0PaymentsPaymentIdRedirectRequest.mockResolvedValue({
      url: 'https://test.url',
      body: 'test=data',
    } as any);

    await getPaymentRedirectUrl(formDataWithNumberAndStreet as any, booking);

    expect(mockPostV0PaymentsPaymentIdRedirectRequest).toHaveBeenCalledWith('payment-777', {
      callback_url: 'https://callback.url/payment',
      payment_condition_id: undefined,
      template_id: 'template-456',
      billing_details: {
        email: 'test@example.com',
        mobile_phone: undefined,
        first_name: undefined,
        last_name: undefined,
        address1: '42 Elm Street',
        locality: undefined,
        postal_code: undefined,
        administrative_area: undefined,
        country_code: undefined,
      },
      token: undefined,
    });
  });
});
