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
import { EnrichedPaymentProvider, MANUAL_CONNECTION_TYPE } from './types.js';
import { sortTimePaymentConditions } from './utils/sortTimePaymentConditions.js';
import { splitByCategory } from './utils/splitByCategory.js';

type ProviderConfig = Awaited<
  ReturnType<PaymentConfigService['getPaymentProvidersConfig']>
>[string];

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
  }: Pick<ResourceRef, 'type' | 'id' | 'customerId' | 'locale' | 'issuerType' | 'userAgent'>) {
    if (type === 'booking' && !customerId) {
      throw new PaymentProvidersValidationError('customer_id is required for booking type');
    }

    const [paymentProvidersConfig, paymentProviders] = await Promise.all([
      this.paymentConfigService.getPaymentProvidersConfig({ locale, issuerType }),
      getV1PaymentProviders(),
    ]);

    const shouldFetchStay = this.shouldFetchStay(paymentProviders, paymentProvidersConfig);
    const stay = shouldFetchStay ? await this.stayService.getStay({ type, id, customerId }) : null;

    const daysUntilDeparture = this.getDaysUntilDeparture(stay);

    const paymentProvidersEligibilityRules: Array<(provider: PaymentProvider1) => boolean> = [
      (provider) => !!paymentProvidersConfig[provider.id],
      (provider) => this.isBeforeMinimumDepartureWindow(paymentProvidersConfig[provider.id], stay),
      (provider) => this.isValidConnectionType(provider, issuerType),
      (provider) => this.isAllowedForUserAgent(paymentProvidersConfig[provider.id], userAgent),
      (provider) => daysUntilDeparture > provider.required_delay_before_departure,
    ];

    return paymentProviders
      .filter((provider) => paymentProvidersEligibilityRules.every((rule) => rule(provider)))
      .map((provider) => {
        const payment_methods = sortTimePaymentConditions(provider.payment_methods)
          ?.map((method) => ({
            ...method,
            time_payment_conditions: method.time_payment_conditions?.filter(
              (condition) => daysUntilDeparture > condition.required_delay_before_departure,
            ),
          }))
          .filter((method) => method.time_payment_conditions?.length !== 0);
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
      .flatMap((provider) => this.flattenManualProvider(provider))
      .reduce(splitByCategory, {
        payment_providers: [],
        buy_now_pay_later_providers: [],
      });
  }

  private flattenManualProvider(provider: EnrichedPaymentProvider) {
    if (provider.connection_type !== MANUAL_CONNECTION_TYPE) {
      return provider;
    }

    return (provider.payment_methods ?? []).map((method) => ({
      ...provider,
      id: method.id,
      description: method.label,
      payment_methods: [],
    }));
  }

  private getDaysUntilDeparture(stay: Stay | null): number {
    const arrival = parseApiDate(stay?.resortArrivalDate);
    return arrival ? daysUntilToday(arrival) : Infinity;
  }

  private isBeforeMinimumDepartureWindow(
    providerConfig: ProviderConfig | undefined,
    stay: Stay | null,
  ): boolean {
    const minDays = providerConfig?.settings?.min_days_before_departure;
    if (!minDays) return true;

    return this.getDaysUntilDeparture(stay) < Number(minDays);
  }

  private isValidConnectionType(provider: PaymentProvider1, issuerType?: string): boolean {
    return issuerType !== 'GM' || provider.connection_type !== MANUAL_CONNECTION_TYPE;
  }

  private isAllowedForUserAgent(
    providerConfig: ProviderConfig | undefined,
    userAgent?: string,
  ): boolean {
    const pattern = providerConfig?.settings?.blocked_user_agent_pattern;
    if (!pattern) return true;
    return !new RegExp(String(pattern), 'i').test(userAgent ?? '');
  }

  private shouldFetchStay(
    providers: PaymentProvider1[],
    config: Record<string, ProviderConfig>,
  ): boolean {
    return providers.some(
      (provider) =>
        !!config[provider.id]?.settings?.min_days_before_departure ||
        provider.required_delay_before_departure > 0 ||
        provider.payment_methods?.some((method) =>
          method.time_payment_conditions?.some(
            (condition) => condition.required_delay_before_departure > 0,
          ),
        ),
    );
  }
}
