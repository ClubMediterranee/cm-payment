import { DITest } from '@tsed/di';

import * as api from '../../infra/api/__generated__/index.js';
import { PaymentConfigService } from '../payment_config/PaymentConfigService.js';
import { PaymentRedirectService } from './PaymentRedirectService.js';

vi.mock('../../infra/api/__generated__/index.js', () => ({
  getV0PaymentsPaymentIdStatus: vi.fn(),
  postV1PaymentsPaymentIdNotify: vi.fn(),
  patchV2BookingsBookingId: vi.fn(),
  postV1Payments: vi.fn(),
  postV0PaymentsPaymentIdRedirectRequest: vi.fn(),
  postV0PaymentProvidersProviderIdRequestToken: vi.fn(),
  getV2ProposalsProposalId: vi.fn(),
  postV3Bookings: vi.fn(),
  PaymentStatus: {
    PENDING: 'PENDING',
    OK: 'OK',
    CANCELED: 'CANCELED',
    REFUSED_CM: 'REFUSED_CM',
    REFUSED_PSP: 'REFUSED_PSP',
  },
  ValidPatchBookingRequestBookingStatusModel: { VALIDATED: 'VALIDATED' },
}));

const getPaymentProvidersConfig = vi.fn();
const getPaymentConfig = vi.fn();

const BASE_URL = 'https://bff.test';

async function invokeService() {
  getPaymentConfig.mockResolvedValue({
    feature_flips: {},
    settings: {
      payment_status_poll_attempts: 3,
      payment_status_poll_delay_ms: 3000,
      dtmf_redirect_retry_attempts: 10,
      dtmf_redirect_retry_delay_ms: 1000,
    },
  });

  await DITest.create({ BASE_URL } as Partial<TsED.Configuration>);
  return DITest.invoke<PaymentRedirectService>(PaymentRedirectService, [
    { token: PaymentConfigService, use: { getPaymentProvidersConfig, getPaymentConfig } },
  ]);
}

function mockStrategy(providerId: string, strategy: 'status' | 'notify') {
  getPaymentProvidersConfig.mockResolvedValue({
    [providerId]: { display_type: 'redirect', confirmation_strategy: strategy, settings: {} },
  });
}

describe('PaymentRedirectService', () => {
  afterEach(() => {
    DITest.reset();
    vi.clearAllMocks();
  });

  describe('handlePaymentRedirect', () => {
    it('should use polling strategy when provider confirmation_strategy is status', async () => {
      const service = await invokeService();
      mockStrategy('EVOXPAY', 'status');

      vi.mocked(api.getV0PaymentsPaymentIdStatus).mockResolvedValue({
        finalisePaymentResponse: {
          paiement: {
            statutPaiement: 'SUCCESS',
            montantVersement: '100.00',
            codeDevise: 'EUR',
            serveurId: 'EVOXPAY',
          },
          dossier: {
            numeroDossier: 'BOOK123',
          },
        },
      } as any);

      const redirectUrl = await service.handlePaymentRedirect('payment123', {
        callback_url: 'https://example.com/callback',
        provider_id: 'EVOXPAY',
        foo: 'bar',
      });

      expect(api.getV0PaymentsPaymentIdStatus).toHaveBeenCalledWith('payment123');
      expect(api.postV1PaymentsPaymentIdNotify).not.toHaveBeenCalled();
      expect(redirectUrl).toContain('https://example.com/callback');
      expect(redirectUrl).toContain('payment_status=SUCCESS');
      expect(redirectUrl).toContain('booking_id=BOOK123');
    });

    it('should use notify strategy when provider confirmation_strategy is notify', async () => {
      const service = await invokeService();
      mockStrategy('HIPAY', 'notify');

      vi.mocked(api.postV1PaymentsPaymentIdNotify).mockResolvedValue({
        payment_status: 'SUCCESS',
        booking_id: 'BOOK456',
        payment_amount: '200.00',
        payment_currency: 'USD',
        provider_id: 'HIPAY',
      } as any);

      const redirectUrl = await service.handlePaymentRedirect('payment456', {
        callback_url: 'https://example.com/callback',
        provider_id: 'HIPAY',
        transaction_id: 'txn789',
        status: 'captured',
      });

      expect(api.postV1PaymentsPaymentIdNotify).toHaveBeenCalledWith('payment456', {
        provider_response: 'transaction_id=txn789&status=captured',
      });
      expect(api.getV0PaymentsPaymentIdStatus).not.toHaveBeenCalled();
      expect(redirectUrl).toContain('https://example.com/callback');
      expect(redirectUrl).toContain('payment_status=SUCCESS');
      expect(redirectUrl).toContain('booking_id=BOOK456');
    });

    it('should default to polling when provider config is missing', async () => {
      const service = await invokeService();
      getPaymentProvidersConfig.mockResolvedValue({});

      vi.mocked(api.getV0PaymentsPaymentIdStatus).mockResolvedValue({
        finalisePaymentResponse: {
          paiement: {
            statutPaiement: 'SUCCESS',
            montantVersement: '10.00',
            codeDevise: 'EUR',
            serveurId: 'UNKNOWN',
          },
          dossier: { numeroDossier: 'BOOK000' },
        },
      } as any);

      await service.handlePaymentRedirect('payment000', {
        callback_url: 'https://example.com/callback',
        provider_id: 'UNKNOWN',
      });

      expect(api.getV0PaymentsPaymentIdStatus).toHaveBeenCalledWith('payment000');
      expect(api.postV1PaymentsPaymentIdNotify).not.toHaveBeenCalled();
    });

    it('should include proposal_id in callback URL when provided', async () => {
      const service = await invokeService();
      mockStrategy('HIPAY', 'notify');

      vi.mocked(api.postV1PaymentsPaymentIdNotify).mockResolvedValue({
        payment_status: 'SUCCESS',
        booking_id: 'BOOK789',
        payment_amount: '150.00',
        payment_currency: 'EUR',
        provider_id: 'HIPAY',
      } as any);

      const redirectUrl = await service.handlePaymentRedirect('payment789', {
        callback_url: 'https://example.com/callback',
        provider_id: 'HIPAY',
        proposal_id: 'PROP123',
      });

      expect(redirectUrl).toContain('proposal_id=PROP123');
    });

    it('should not include proposal_id when not provided', async () => {
      const service = await invokeService();
      mockStrategy('HIPAY', 'notify');

      vi.mocked(api.postV1PaymentsPaymentIdNotify).mockResolvedValue({
        payment_status: 'SUCCESS',
        booking_id: 'BOOK999',
        payment_amount: '50.00',
        payment_currency: 'GBP',
        provider_id: 'HIPAY',
      } as any);

      const redirectUrl = await service.handlePaymentRedirect('payment999', {
        callback_url: 'https://example.com/callback',
        provider_id: 'HIPAY',
      });

      expect(redirectUrl).not.toContain('proposal_id');
    });

    it('should include locale in callback URL when provided', async () => {
      const service = await invokeService();
      mockStrategy('HIPAY', 'notify');

      vi.mocked(api.postV1PaymentsPaymentIdNotify).mockResolvedValue({
        payment_status: 'SUCCESS',
        booking_id: 'BOOK333',
        payment_amount: '120.00',
        payment_currency: 'EUR',
        provider_id: 'HIPAY',
      } as any);

      const redirectUrl = await service.handlePaymentRedirect('payment333', {
        callback_url: 'https://example.com/callback',
        provider_id: 'HIPAY',
        locale: 'fr-FR',
      });

      expect(redirectUrl).toContain('locale=fr-FR');
    });

    it('should default notify response fields to empty strings when missing', async () => {
      const service = await invokeService();
      mockStrategy('HIPAY', 'notify');

      vi.mocked(api.postV1PaymentsPaymentIdNotify).mockResolvedValue({} as any);

      const redirectUrl = await service.handlePaymentRedirect('payment444', {
        callback_url: 'https://example.com/callback',
        provider_id: 'HIPAY',
      });

      expect(redirectUrl).toContain('payment_status=');
      expect(redirectUrl).toContain('booking_id=');
    });

    it('should throw error when callback_url is missing', async () => {
      const service = await invokeService();
      mockStrategy('HIPAY', 'notify');

      vi.mocked(api.postV1PaymentsPaymentIdNotify).mockResolvedValue({
        payment_status: 'SUCCESS',
        booking_id: 'BOOK111',
        payment_amount: '75.00',
        payment_currency: 'EUR',
        provider_id: 'HIPAY',
      } as any);

      await expect(
        service.handlePaymentRedirect('payment111', {
          provider_id: 'HIPAY',
        }),
      ).rejects.toThrow('callback_url is required');
    });

    it('should poll until payment is no longer PENDING', async () => {
      const service = await invokeService();
      mockStrategy('EVOXPAY', 'status');

      vi.mocked(api.getV0PaymentsPaymentIdStatus)
        .mockResolvedValueOnce({
          finalisePaymentResponse: {
            paiement: {
              statutPaiement: 'PENDING',
              montantVersement: '100.00',
              codeDevise: 'EUR',
              serveurId: 'EVOXPAY',
            },
            dossier: {
              numeroDossier: 'BOOK222',
            },
          },
        } as any)
        .mockResolvedValueOnce({
          finalisePaymentResponse: {
            paiement: {
              statutPaiement: 'SUCCESS',
              montantVersement: '100.00',
              codeDevise: 'EUR',
              serveurId: 'EVOXPAY',
            },
            dossier: {
              numeroDossier: 'BOOK222',
            },
          },
        } as any);

      const redirectUrl = await service.handlePaymentRedirect('payment222', {
        callback_url: 'https://example.com/callback',
        provider_id: 'EVOXPAY',
      });

      expect(api.getV0PaymentsPaymentIdStatus).toHaveBeenCalledTimes(2);
      expect(redirectUrl).toContain('payment_status=SUCCESS');
    });
  });

  describe('manual provider confirmation', () => {
    const context = { locale: 'fr-FR' };
    const manualBody = {
      type: 'booking' as const,
      id: 'BOOK_OK',
      customer_id: 'CUST1',
      provider_id: 'MMANUAL',
      connection_type: 'Manual',
      action: 'PAYMENT_RESA' as any,
      amount: '100',
      currency: 'EUR',
      callback_url: 'https://client.callback',
      callback_url_seller: 'https://example.com/callback',
    };

    it('validates the booking and redirects with payment_status=OK on success', async () => {
      const service = await invokeService();
      vi.mocked(api.patchV2BookingsBookingId).mockResolvedValue(undefined as any);

      const { redirect } = await service.createPaymentRedirect(manualBody, context);

      expect(api.patchV2BookingsBookingId).toHaveBeenCalledWith('BOOK_OK', {
        booking_status: 'VALIDATED',
        customer_id: 'CUST1',
        currency: 'EUR',
        payments: [{ method_id: 'MMANUAL', amount: 100 }],
      });
      expect(redirect.url).toContain('https://example.com/callback');
      expect(redirect.url).toContain('payment_status=OK');
      expect(redirect.url).toContain('booking_id=BOOK_OK');
      expect(redirect.url).toContain('payment_amount=100');
      expect(redirect.url).toContain('payment_currency=EUR');
    });

    it('forwards the comment on the payment when provided', async () => {
      const service = await invokeService();
      vi.mocked(api.patchV2BookingsBookingId).mockResolvedValue(undefined as any);

      await service.createPaymentRedirect({ ...manualBody, comments: 'account to debit' }, context);

      expect(api.patchV2BookingsBookingId).toHaveBeenCalledWith('BOOK_OK', {
        booking_status: 'VALIDATED',
        customer_id: 'CUST1',
        currency: 'EUR',
        payments: [{ method_id: 'MMANUAL', amount: 100, comments: 'account to debit' }],
      });
    });

    it('redirects with payment_status=REFUSED_CM when the booking PATCH fails', async () => {
      const service = await invokeService();
      vi.mocked(api.patchV2BookingsBookingId).mockRejectedValue(new Error('Unauthorized'));

      const { redirect } = await service.createPaymentRedirect(
        { ...manualBody, id: 'BOOK_KO', customer_id: 'CUST2', amount: '250', currency: 'USD' },
        context,
      );

      expect(redirect.url).toContain('https://example.com/callback');
      expect(redirect.url).toContain('payment_status=REFUSED_CM');
      expect(redirect.url).toContain('booking_id=BOOK_KO');
      expect(redirect.url).toContain('payment_amount=250');
      expect(redirect.url).toContain('payment_currency=USD');
    });
  });

  describe('createPaymentRedirect', () => {
    const baseBody = {
      type: 'booking' as const,
      id: 'BOOK1',
      customer_id: 'CUST1',
      provider_id: 'EVOXPAY',
      action: 'PAYMENT_RESA' as any,
      amount: '100',
      currency: 'EUR',
      callback_url: 'https://client.callback',
    };

    const context = { locale: 'fr-FR' };

    beforeEach(() => {
      vi.mocked(api.postV1Payments).mockResolvedValue({ id: 'PAY1' } as any);
      vi.mocked(api.postV0PaymentsPaymentIdRedirectRequest).mockResolvedValue({
        url: 'https://psp',
        method: 'GET',
      } as any);
      mockStrategy('EVOXPAY', 'status');
    });

    it('creates the payment and returns the provider redirect for a standard payment', async () => {
      const service = await invokeService();

      const result = await service.createPaymentRedirect(
        { ...baseBody, template_id: '6' },
        context,
      );

      expect(api.postV1Payments).toHaveBeenCalledWith(
        expect.objectContaining({
          booking_id: 'BOOK1',
          customer_id: 'CUST1',
          provider_id: 'EVOXPAY',
          amount: 100,
          action: 'PAYMENT_RESA',
        }),
      );
      expect(api.postV0PaymentProvidersProviderIdRequestToken).not.toHaveBeenCalled();
      expect(api.postV0PaymentsPaymentIdRedirectRequest).toHaveBeenCalledWith(
        'PAY1',
        expect.objectContaining({ template_id: '6' }),
      );
      expect(result.payment?.callbacks.callback_url).toContain('mode=redirect');
      expect(result.payment?.callbacks.callback_url).toContain(
        `${BASE_URL}/rest/payment_redirect/PAY1`,
      );
      expect(result).toEqual({
        redirect: { url: 'https://psp', method: 'GET' },
        payment: {
          paymentId: 'PAY1',
          callbacks: { callback_url: expect.stringContaining('/rest/payment_redirect/PAY1') },
        },
      });
    });

    it('requests a provider token with uuid for an incoming DTMF call and injects open_id', async () => {
      const service = await invokeService();
      vi.mocked(api.postV0PaymentProvidersProviderIdRequestToken).mockResolvedValue({
        token: 'DTMF_TOKEN',
      } as any);

      await service.createPaymentRedirect(
        { ...baseBody, template_id: '1', uuid: 'CALL_UUID' },
        context,
      );

      expect(api.postV0PaymentProvidersProviderIdRequestToken).toHaveBeenCalledWith('EVOXPAY', {
        params: { uuid: 'CALL_UUID' },
      });
      expect(api.postV0PaymentsPaymentIdRedirectRequest).toHaveBeenCalledWith(
        'PAY1',
        expect.objectContaining({ open_id: 'DTMF_TOKEN' }),
      );
    });

    it('requests a provider token with reference for an outgoing DTMF call', async () => {
      const service = await invokeService();
      vi.mocked(api.postV0PaymentProvidersProviderIdRequestToken).mockResolvedValue({
        token: 'DTMF_TOKEN',
      } as any);

      await service.createPaymentRedirect(
        { ...baseBody, template_id: '1', reference: 'CONTACT_REF' },
        context,
      );

      expect(api.postV0PaymentProvidersProviderIdRequestToken).toHaveBeenCalledWith('EVOXPAY', {
        params: { reference: 'CONTACT_REF' },
      });
    });

    it('retries the redirect request for DTMF until the backoffice finds the secured call', async () => {
      vi.useFakeTimers();
      const service = await invokeService();
      vi.mocked(api.postV0PaymentProvidersProviderIdRequestToken).mockResolvedValue({
        token: 'DTMF_TOKEN',
      } as any);
      vi.mocked(api.postV0PaymentsPaymentIdRedirectRequest)
        .mockRejectedValueOnce(new Error('secured call not found'))
        .mockRejectedValueOnce(new Error('secured call not found'))
        .mockResolvedValueOnce({ url: 'https://psp', method: 'GET' } as any);

      const promise = service.createPaymentRedirect(
        { ...baseBody, template_id: '1', uuid: 'CALL_UUID' },
        context,
      );

      await vi.runAllTimersAsync();
      const result = await promise;

      expect(api.postV0PaymentsPaymentIdRedirectRequest).toHaveBeenCalledTimes(3);
      expect(result.redirect).toEqual({ url: 'https://psp', method: 'GET' });
      vi.useRealTimers();
    });

    it('does not retry a standard (non-DTMF) redirect request', async () => {
      const service = await invokeService();
      vi.mocked(api.postV0PaymentsPaymentIdRedirectRequest).mockRejectedValueOnce(
        new Error('boom'),
      );

      await expect(
        service.createPaymentRedirect({ ...baseBody, template_id: '6' }, context),
      ).rejects.toThrow('boom');
      expect(api.postV0PaymentsPaymentIdRedirectRequest).toHaveBeenCalledTimes(1);
    });

    it('resolves a booking from a proposal before creating the payment', async () => {
      const service = await invokeService();
      vi.mocked(api.getV2ProposalsProposalId).mockResolvedValue({
        households: [{ attendees: [{ customer_id: 'CUST_FROM_PROPOSAL' }] }],
      } as any);
      vi.mocked(api.postV3Bookings).mockResolvedValue({ booking_id: 'BOOK_FROM_PROPOSAL' } as any);

      await service.createPaymentRedirect(
        { ...baseBody, type: 'proposal', id: 'PROP1', customer_id: undefined, template_id: '6' },
        context,
      );

      expect(api.getV2ProposalsProposalId).toHaveBeenCalledWith('PROP1');
      expect(api.postV1Payments).toHaveBeenCalledWith(
        expect.objectContaining({
          booking_id: 'BOOK_FROM_PROPOSAL',
          customer_id: 'CUST_FROM_PROPOSAL',
        }),
      );
    });

    it('confirms the booking without payment for a manual provider', async () => {
      const service = await invokeService();
      vi.mocked(api.patchV2BookingsBookingId).mockResolvedValue(undefined as any);

      const result = await service.createPaymentRedirect(
        {
          ...baseBody,
          connection_type: 'Manual',
          callback_url_seller: 'https://seller.callback',
          template_id: '6',
        },
        context,
      );

      expect(api.postV1Payments).not.toHaveBeenCalled();
      expect(api.postV0PaymentsPaymentIdRedirectRequest).not.toHaveBeenCalled();
      expect(result.redirect.method).toBe('GET');
      expect(result.redirect.url).toContain('https://seller.callback');
      expect(result.payment).toBeUndefined();
    });

    it('confirms a manual proposal and carries the proposal id in the redirect', async () => {
      const service = await invokeService();
      vi.mocked(api.getV2ProposalsProposalId).mockResolvedValue({
        households: [{ attendees: [{ customer_id: 'CUST_FROM_PROPOSAL' }] }],
      } as any);
      vi.mocked(api.postV3Bookings).mockResolvedValue({ booking_id: 'BOOK_FROM_PROPOSAL' } as any);
      vi.mocked(api.patchV2BookingsBookingId).mockResolvedValue(undefined as any);

      const result = await service.createPaymentRedirect(
        {
          ...baseBody,
          type: 'proposal',
          id: 'PROP1',
          customer_id: undefined,
          connection_type: 'Manual',
          callback_url_seller: 'https://seller.callback',
        },
        context,
      );

      expect(api.patchV2BookingsBookingId).toHaveBeenCalledWith(
        'BOOK_FROM_PROPOSAL',
        expect.anything(),
      );
      expect(result.redirect.url).toContain('proposal_id=PROP1');
    });

    it('throws for a manual provider without a seller callback url', async () => {
      const service = await invokeService();
      vi.mocked(api.patchV2BookingsBookingId).mockResolvedValue(undefined as any);

      await expect(
        service.createPaymentRedirect({ ...baseBody, connection_type: 'Manual' }, context),
      ).rejects.toThrow('callback_url is required');
    });

    it('forwards the donation amount when creating the payment', async () => {
      const service = await invokeService();

      await service.createPaymentRedirect(
        { ...baseBody, template_id: '6', donation_amount: 20 },
        context,
      );

      expect(api.postV1Payments).toHaveBeenCalledWith(
        expect.objectContaining({ donation_amount: 20 }),
      );
    });
  });
});
