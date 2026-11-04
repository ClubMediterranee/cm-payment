import { Inject, Service } from '@tsed/di';

import {
  businessTransaction,
  simulation,
  type SimulationParams,
} from '../../infra/oney/__generated__/index.js';
import { PaymentConfigService } from '../payment_config/PaymentConfigService.js';
import { mapOneySimulation } from './mappers/mapOneySimulation.js';
import type { BnplSimulation } from './types.js';

export type BnplProviderId = 'EHIPAYBNPL';

@Service()
export class BnplSimulationService {
  @Inject()
  protected paymentConfigService!: PaymentConfigService;

  async simulate(
    providerId: BnplProviderId,
    locale: string,
    params: Pick<SimulationParams, 'payment_amount'>,
  ): Promise<BnplSimulation> {
    switch (providerId) {
      case 'EHIPAYBNPL':
        return this.simulateOney(locale, params);
    }
  }

  private async simulateOney(
    locale: string,
    params: Pick<SimulationParams, 'payment_amount'>,
  ): Promise<BnplSimulation> {
    const configs = await this.paymentConfigService.getPaymentProvidersConfig({ locale });
    const {
      api_key: apiKey,
      merchant_id: merchantId,
      psp_guid,
      payment_mode,
      is_free,
    } = configs['EHIPAYBNPL']?.settings ?? {};

    const countryCode = locale.split('-')[1];
    const fetcherOptions = { apiKey, countryCode };

    const transactions = await businessTransaction(
      {
        merchant_guid: merchantId,
        psp_guid,
        payment_amount: params.payment_amount,
        free_business_transaction: is_free === 'true',
      },
      fetcherOptions,
    );

    const match = (transactions || []).find((t) =>
      t.short_label.toLowerCase().includes(payment_mode.toLowerCase()),
    );

    if (!match) {
      throw new Error(`Simulation unavailable for payment mode "${payment_mode}"`);
    }

    return mapOneySimulation(
      await simulation(
        {
          ...params,
          merchant_guid: merchantId,
          psp_guid,
          business_transaction_code: match.business_transaction_code,
        },
        fetcherOptions,
      ),
    );
  }
}
