import { Inject, Service } from '@tsed/di';

import { getV1PaymentProviders } from '../../infra/api/__generated__/index.js';
import { PaymentProvider1 } from '../../infra/api/__generated__/index.schemas.js';
import { PaymentConfigService } from '../payment_config/PaymentConfigService.js';
import { Stay } from '../stay/models.js';
import { StayService } from '../stay/StayService.js';
import { PaymentProvidersResponse } from './models.js';
import { GetPaymentProvidersParams, ProviderConfigMap } from './types.js';
import { enrichWithConfig } from './utils/enrichWithConfig.js';
import { enrichWithPaymentConditions } from './utils/enrichWithPaymentConditions.js';
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
  }: GetPaymentProvidersParams): Promise<PaymentProvidersResponse> {
    const [paymentProvidersConfig, paymentProviders]: [ProviderConfigMap, PaymentProvider1[]] =
      await Promise.all([
        this.paymentConfigService.getPaymentProvidersConfig({ locale, issuerType }),
        getV1PaymentProviders(),
      ]);

    const shouldFetchStay = this.shouldFetchStay(paymentProviders, paymentProvidersConfig);
    const stay = shouldFetchStay ? await this.stayService.getStay({ type, id, customerId }) : null;

    return paymentProviders
      .filter((provider) => this.isActiveProvider(provider, paymentProvidersConfig))
      .filter((provider) => this.isWithinDepartureDate(provider, paymentProvidersConfig, stay))
      .map((provider) => enrichWithConfig([provider], paymentProvidersConfig)[0])
      .map(sortTimePaymentConditions)
      .map(enrichWithPaymentConditions)
      .reduce(splitByCategory, {
        payment_providers: [],
        buy_now_pay_later_providers: [],
      });
  }

  private isActiveProvider(provider: PaymentProvider1, config: ProviderConfigMap): boolean {
    return config[provider.id]?.is_active === true;
  }

  private isWithinDepartureDate(
    provider: PaymentProvider1,
    config: ProviderConfigMap,
    stay: Stay | null,
  ): boolean {
    if (!stay?.resortArrivalDate) return true;

    const providerConfig = config[provider.id];
    const minDays = providerConfig?.settings?.min_days_before_departure;
    if (!minDays) return true;

    const daysUntilDeparture = this.daysUntilToday(new Date(stay.resortArrivalDate));
    return daysUntilDeparture < Number(minDays);
  }

  private daysUntilToday(date: Date): number {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private shouldFetchStay(providers: PaymentProvider1[], config: ProviderConfigMap): boolean {
    return providers.some((provider) => {
      const providerConfig = config[provider.id];
      return providerConfig?.is_active && !!providerConfig?.settings?.min_days_before_departure;
    });
  }
}
