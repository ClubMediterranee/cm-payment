import { Inject, Service } from '@tsed/di';

import { getV1PaymentProviders } from '../../infra/api/__generated__/index.js';
import { PaymentProvider1 } from '../../infra/api/__generated__/index.js';
import { daysUntilToday } from '../../utils/daysUntilToday.js';
import { parseApiDate } from '../../utils/parseApiDate.js';
import { ResourceRef } from '../../utils/types.js';
import { PaymentConfigService } from '../payment_config/PaymentConfigService.js';
import { Stay } from '../stay/models.js';
import { StayService } from '../stay/StayService.js';
import { PaymentProvidersValidationError } from './errors.js';
import { PaymentProvidersResponse, ProviderConfigMap } from './types.js';
import { sortTimePaymentConditions } from './utils/sortTimePaymentConditions.js';
import { splitByCategory } from './utils/splitByCategory.js';

@Service()
export class PaymentProvidersService {
  @Inject()
  protected paymentConfigService!: PaymentConfigService;

  @Inject()
  protected stayService!: StayService;

  async getPaymentProviders({
    type,
    id,
    locale,
    issuerType,
    customerId,
    userAgent,
  }: Pick<
    ResourceRef,
    'type' | 'id' | 'customerId' | 'locale' | 'issuerType' | 'userAgent'
  >): Promise<PaymentProvidersResponse> {
    if (type === 'booking' && !customerId) {
      throw new PaymentProvidersValidationError('customer_id is required for booking type');
    }

    const [paymentProvidersConfig, paymentProviders]: [ProviderConfigMap, PaymentProvider1[]] =
      await Promise.all([
        this.paymentConfigService.getPaymentProvidersConfig({ locale }),
        getV1PaymentProviders(),
      ]);

    const shouldFetchStay = this.shouldFetchStay(paymentProviders, paymentProvidersConfig);
    const stay = shouldFetchStay ? await this.stayService.getStay({ type, id, customerId }) : null;

    const paymentProvidersEligibilityRules: Array<(provider: PaymentProvider1) => boolean> = [
      (provider) => !!paymentProvidersConfig[provider.id],
      (provider) => this.isBeforeMinimumDepartureWindow(provider, paymentProvidersConfig, stay),
      (provider) => this.isValidConnectionType(provider, issuerType),
      (provider) => this.isAllowedForUserAgent(provider, paymentProvidersConfig, userAgent),
    ];

    return paymentProviders
      .filter((provider) => paymentProvidersEligibilityRules.every((rule) => rule(provider)))
      .map((provider) => {
        const payment_methods = sortTimePaymentConditions(provider.payment_methods);
        const payment_conditions = Object.fromEntries(
          (payment_methods ?? []).map((method) => [
            method.label || method.id,
            method.time_payment_conditions ?? [],
          ]),
        );

        return {
          ...provider,
          payment_methods,
          configuration: paymentProvidersConfig[provider.id],
          payment_conditions,
        };
      })
      .reduce(splitByCategory, {
        payment_providers: [],
        buy_now_pay_later_providers: [],
      });
  }

  private isBeforeMinimumDepartureWindow(
    provider: PaymentProvider1,
    config: ProviderConfigMap,
    stay: Stay | null,
  ): boolean {
    if (!stay?.resortArrivalDate) return true;

    const providerConfig = config[provider.id];
    const minDays = providerConfig?.settings?.min_days_before_departure;
    if (!minDays) return true;

    const arrival = parseApiDate(stay.resortArrivalDate);
    if (!arrival) return true;

    const daysUntilDeparture = daysUntilToday(arrival);
    return daysUntilDeparture < Number(minDays);
  }

  private isValidConnectionType(provider: PaymentProvider1, issuerType?: string): boolean {
    return issuerType !== 'GM' || provider.connection_type !== 'Manual';
  }

  private isAllowedForUserAgent(
    provider: PaymentProvider1,
    config: ProviderConfigMap,
    userAgent?: string,
  ): boolean {
    const pattern = config[provider.id]?.settings?.blocked_user_agent_pattern;
    if (!pattern) return true;
    return !new RegExp(String(pattern), 'i').test(userAgent ?? '');
  }

  private shouldFetchStay(providers: PaymentProvider1[], config: ProviderConfigMap): boolean {
    return providers.some((provider) => {
      const providerConfig = config[provider.id];
      return !!providerConfig?.settings?.min_days_before_departure;
    });
  }
}
