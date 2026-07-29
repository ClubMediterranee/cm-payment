import { constant, Inject, Service } from '@tsed/di';

import {
  getV0PaymentsPaymentIdStatus,
  PatchBookingPaymentModel,
  patchV2BookingsBookingId,
  PaymentRedirectRequestModel,
  PaymentStatus,
  postV0PaymentProvidersProviderIdRequestToken,
  postV0PaymentsPaymentIdRedirectRequest,
  postV1Payments,
  postV1PaymentsPaymentIdNotify,
  ValidPatchBookingRequestBookingStatusModel,
} from '../../infra/api/__generated__/index.js';
import { PaymentConfigService } from '../payment_config/PaymentConfigService.js';
import { TEMPLATE_IDS } from './constants.js';
import { PaymentRedirectRequestBody, PaymentRedirectRequestResult } from './models.js';
import { buildConfirmationUrl } from './utils/buildConfirmationUrl.js';
import { getRedirectPaymentCallbackUrls } from './utils/getRedirectPaymentCallbackUrls.js';
import { mapBillingDetails } from './utils/mapBillingDetails.js';
import { poll } from './utils/poll.js';
import { resolveBooking } from './utils/resolveBooking.js';
import { retry } from './utils/retry.js';

const MANUAL_CONNECTION_TYPE = 'Manual';

@Service()
export class PaymentRedirectService {
  @Inject()
  protected paymentConfigService!: PaymentConfigService;

  async createPaymentRedirect(
    body: PaymentRedirectRequestBody,
    { locale }: { locale: string },
  ): Promise<PaymentRedirectRequestResult> {
    const { bookingId, customerId } = await resolveBooking({
      type: body.type,
      id: body.id,
      customerId: body.customer_id,
      ...(body.connection_type !== MANUAL_CONNECTION_TYPE ? { comment: body.comments } : {}),
    });

    const proposalId = body.type === 'proposal' ? body.id : undefined;

    if (body.connection_type === MANUAL_CONNECTION_TYPE) {
      const redirectUrl = await this.confirmBookingWithoutPayment({
        bookingId: bookingId!,
        customerId: customerId!,
        providerId: body.provider_id,
        amount: body.amount,
        currency: body.currency,
        callbackUrl: body.callback_url_seller || '',
        proposalId,
        locale,
        comments: body.comments,
      });

      return { redirect: { url: redirectUrl, method: 'GET' } };
    }

    const { id: paymentId } = await postV1Payments({
      booking_id: bookingId!,
      customer_id: customerId!,
      currency: body.currency,
      action: body.action,
      amount: Number(body.amount),
      provider_id: body.provider_id,
      // cast donation_amount to 0 to contourn an api typing issue
      ...(body.donation_amount ? { donation_amount: body.donation_amount as 0 } : {}),
    });

    const providersConfig = await this.paymentConfigService.getPaymentProvidersConfig({ locale });

    const callbacks = getRedirectPaymentCallbackUrls({
      paymentId,
      providerId: body.provider_id,
      apiUrl: constant<string>('BASE_URL', ''),
      locale,
      callbackUrl: body.callback_url,
      callbackUrlSeller: body.callback_url_seller,
      proposalId,
      params: { mode: providersConfig[body.provider_id]?.display_type },
    });

    const redirectPayload = {
      ...callbacks,
      payment_condition_id: body.payment_condition_id,
      template_id: body.template_id,
      billing_details: mapBillingDetails(body.billing_details, body.template_id),
      token: body.token,
    };

    const redirect =
      body.template_id === TEMPLATE_IDS.call
        ? await this.sendDtmfRedirectRequest({ paymentId, body, redirectPayload })
        : await postV0PaymentsPaymentIdRedirectRequest(paymentId, redirectPayload);

    return { redirect, payment: { paymentId, callbacks } };
  }

  private async sendDtmfRedirectRequest({
    paymentId,
    body,
    redirectPayload,
  }: {
    paymentId: string;
    body: PaymentRedirectRequestBody;
    redirectPayload: PaymentRedirectRequestModel;
  }) {
    const { settings } = await this.paymentConfigService.getPaymentConfig();

    const { token } = await postV0PaymentProvidersProviderIdRequestToken(body.provider_id, {
      params: body.uuid ? { uuid: body.uuid } : { reference: body.reference },
    });

    return retry(
      () =>
        postV0PaymentsPaymentIdRedirectRequest(paymentId, { ...redirectPayload, open_id: token }),
      {
        attempts: settings.dtmf_redirect_retry_attempts,
        delay: settings.dtmf_redirect_retry_delay_ms,
      },
    );
  }

  async handlePaymentRedirect(paymentId: string, queryParams: Record<string, any>) {
    const { callback_url, proposal_id, provider_id, locale, ...providerResponse } = queryParams;

    const providersConfig = await this.paymentConfigService.getPaymentProvidersConfig({ locale });

    const paymentData =
      providersConfig[provider_id]?.confirmation_strategy === 'notify'
        ? await this.confirmPaymentWithNotify(paymentId, providerResponse)
        : await this.confirmPaymentWithPolling(paymentId);

    return buildConfirmationUrl({
      callbackUrl: callback_url,
      paymentData,
      proposalId: proposal_id,
      locale,
    });
  }

  private async confirmBookingWithoutPayment({
    bookingId,
    customerId,
    providerId,
    amount,
    currency,
    callbackUrl,
    proposalId,
    locale,
    comments,
  }: {
    bookingId: string;
    customerId: string;
    providerId: string;
    amount: string;
    currency: string;
    callbackUrl: string;
    proposalId?: string;
    locale: string;
    comments: PatchBookingPaymentModel['comments'];
  }) {
    let paymentStatus: PaymentStatus = PaymentStatus.OK;

    try {
      await patchV2BookingsBookingId(bookingId, {
        booking_status: ValidPatchBookingRequestBookingStatusModel.VALIDATED,
        customer_id: customerId,
        currency,
        payments: [
          {
            method_id: providerId,
            amount: Number(amount),
            ...(comments ? { comments } : {}),
          },
        ],
      });
    } catch {
      paymentStatus = PaymentStatus.REFUSED_CM;
    }

    return buildConfirmationUrl({
      callbackUrl,
      paymentData: {
        payment_status: paymentStatus,
        booking_id: bookingId,
        payment_amount: String(amount),
        payment_currency: currency,
        provider_id: providerId,
      },
      proposalId,
      locale,
    });
  }

  private async confirmPaymentWithNotify(paymentId: string, providerResponse: Record<string, any>) {
    const response = await postV1PaymentsPaymentIdNotify(paymentId, {
      provider_response: new URLSearchParams(providerResponse).toString(),
    });

    return {
      payment_status: response.payment_status,
      booking_id: response.booking_id || '',
      payment_amount: String(response.payment_amount || ''),
      payment_currency: response.payment_currency || '',
      provider_id: response.provider_id || '',
    };
  }

  private async confirmPaymentWithPolling(paymentId: string) {
    const { settings } = await this.paymentConfigService.getPaymentConfig();

    const response = await poll(() => getV0PaymentsPaymentIdStatus(paymentId), {
      attempts: settings.payment_status_poll_attempts,
      delay: settings.payment_status_poll_delay_ms,
      continue: (res) => res.finalisePaymentResponse.paiement.statutPaiement === 'PENDING',
    });

    const { paiement, dossier } = response.finalisePaymentResponse;

    return {
      payment_status: paiement.statutPaiement as PaymentStatus,
      booking_id: dossier.numeroDossier,
      payment_amount: paiement.montantVersement,
      payment_currency: paiement.codeDevise,
      provider_id: paiement.serveurId,
    };
  }
}
