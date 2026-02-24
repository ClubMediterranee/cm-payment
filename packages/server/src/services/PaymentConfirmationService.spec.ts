import { DITest } from '@tsed/di';
import { describe, expect, it, vi } from 'vitest';

import * as api from '../infra/api/__generated__/index.js';
import { PaymentConfirmationService } from './PaymentConfirmationService.js';

vi.mock('../infra/api/__generated__/index.js', () => ({
  getV0PaymentsPaymentIdStatus: vi.fn(),
  postV1PaymentsPaymentIdNotify: vi.fn(),
}));

describe('PaymentConfirmationService', () => {
  afterEach(() => {
    DITest.reset();
    vi.clearAllMocks();
  });

  describe('handlePaymentRedirect', () => {
    it('should use polling strategy for EVOXPAY provider', async () => {
      const service = await DITest.invoke(PaymentConfirmationService);

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

    it('should use notify strategy for HIPAY provider', async () => {
      const service = await DITest.invoke(PaymentConfirmationService);

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

    it('should include proposal_id in callback URL when provided', async () => {
      const service = await DITest.invoke(PaymentConfirmationService);

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
      const service = await DITest.invoke(PaymentConfirmationService);

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

    it('should throw error when callback_url is missing', async () => {
      const service = await DITest.invoke(PaymentConfirmationService);

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
      const service = await DITest.invoke(PaymentConfirmationService);

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
});
