import { DITest } from '@tsed/di';

import * as api from '../../infra/api/__generated__/index.js';
import { PaymentConfigService } from '../payment_config/PaymentConfigService.js';
import { PaymentRedirectService } from './PaymentRedirectService.js';

vi.mock('../../infra/api/__generated__/index.js', () => ({
  getV0PaymentsPaymentIdStatus: vi.fn(),
  postV1PaymentsPaymentIdNotify: vi.fn(),
  patchV2BookingsBookingId: vi.fn(),
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

function invokeService() {
  return DITest.invoke<PaymentRedirectService>(PaymentRedirectService, [
    { token: PaymentConfigService, use: { getPaymentProvidersConfig } },
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

  describe('confirmBookingWithoutPayment', () => {
    it('should validate the booking and redirect with payment_status=OK on success', async () => {
      const service = await invokeService();

      vi.mocked(api.patchV2BookingsBookingId).mockResolvedValue(undefined as any);

      const redirectUrl = await service.confirmBookingWithoutPayment('BOOK_OK', {
        callback_url: 'https://example.com/callback',
        provider_id: 'MMANUAL',
        customer_id: 'CUST1',
        amount: '100',
        currency: 'EUR',
      });

      expect(api.patchV2BookingsBookingId).toHaveBeenCalledWith('BOOK_OK', {
        booking_status: 'VALIDATED',
        customer_id: 'CUST1',
        currency: 'EUR',
        payments: [{ method_id: 'MMANUAL', amount: 100 }],
      });
      expect(redirectUrl).toContain('https://example.com/callback');
      expect(redirectUrl).toContain('payment_status=OK');
      expect(redirectUrl).toContain('booking_id=BOOK_OK');
      expect(redirectUrl).toContain('payment_amount=100');
      expect(redirectUrl).toContain('payment_currency=EUR');
    });

    it('should redirect with payment_status=REFUSED_CM when the booking PATCH fails', async () => {
      const service = await invokeService();

      vi.mocked(api.patchV2BookingsBookingId).mockRejectedValue(new Error('Unauthorized'));

      const redirectUrl = await service.confirmBookingWithoutPayment('BOOK_KO', {
        callback_url: 'https://example.com/callback',
        provider_id: 'MMANUAL',
        customer_id: 'CUST2',
        amount: '250',
        currency: 'USD',
      });

      expect(redirectUrl).toContain('https://example.com/callback');
      expect(redirectUrl).toContain('payment_status=REFUSED_CM');
      expect(redirectUrl).toContain('booking_id=BOOK_KO');
      expect(redirectUrl).toContain('payment_amount=250');
      expect(redirectUrl).toContain('payment_currency=USD');
    });
  });
});
