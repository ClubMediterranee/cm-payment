import { Inject, Service } from '@tsed/di';

import {
  getV0PaymentsPaymentIdStatus,
  postV1PaymentsPaymentIdNotify,
} from '../../infra/api/__generated__/index.js';
import { PaymentConfigService } from '../payment_config/PaymentConfigService.js';
import { poll } from './utils/poll.js';

type PaymentData = {
  payment_status: string;
  booking_id: string;
  payment_amount: string;
  payment_currency: string;
  provider_id: string;
};

@Service()
export class PaymentConfirmationService {
  @Inject()
  protected paymentConfigService!: PaymentConfigService;

  async handlePaymentRedirect(
    paymentId: string,
    queryParams: Record<string, any>,
  ): Promise<string> {
    const { callback_url, proposal_id, provider_id, locale, ...providerResponse } = queryParams;

    const providersConfig = await this.paymentConfigService.getPaymentProvidersConfig({ locale });

    const paymentData =
      providersConfig[provider_id]?.confirmation_strategy === 'notify'
        ? await this.confirmPaymentWithNotify(paymentId, providerResponse)
        : await this.confirmPaymentWithPolling(paymentId);

    return this.buildCallbackUrl(callback_url, paymentData, proposal_id, locale);
  }

  private async confirmPaymentWithNotify(
    paymentId: string,
    providerResponse: Record<string, any>,
  ): Promise<PaymentData> {
    const response = await postV1PaymentsPaymentIdNotify(paymentId, {
      provider_response: new URLSearchParams(providerResponse).toString(),
    });

    return {
      payment_status: response.payment_status || '',
      booking_id: response.booking_id || '',
      payment_amount: String(response.payment_amount || ''),
      payment_currency: response.payment_currency || '',
      provider_id: response.provider_id || '',
    };
  }

  private async confirmPaymentWithPolling(paymentId: string): Promise<PaymentData> {
    const response = await poll(() => getV0PaymentsPaymentIdStatus(paymentId), {
      attempts: 3,
      delay: 1000,
      continue: (res) => res.finalisePaymentResponse.paiement.statutPaiement === 'PENDING',
    });

    const { paiement, dossier } = response.finalisePaymentResponse;

    return {
      payment_status: paiement.statutPaiement,
      booking_id: dossier.numeroDossier,
      payment_amount: paiement.montantVersement,
      payment_currency: paiement.codeDevise,
      provider_id: paiement.serveurId,
    };
  }

  private buildCallbackUrl(
    callbackUrl: string | null,
    paymentData: PaymentData,
    proposalId: string | null,
    locale: string | null,
  ): string {
    if (!callbackUrl) {
      throw new Error('callback_url is required');
    }

    const params = new URLSearchParams({
      ...paymentData,
      ...(proposalId ? { proposal_id: proposalId } : {}),
      ...(locale ? { locale } : {}),
    });

    return `${callbackUrl}?${params.toString()}`;
  }
}
