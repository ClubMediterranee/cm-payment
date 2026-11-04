import { Inject, Service } from '@tsed/di';

import {
  getV3CustomersCustomerIdBookingsBookingId,
  SoldBy,
} from '../../infra/api/__generated__/index.js';
import { PaymentConfigService } from '../payment_config/PaymentConfigService.js';
import { OidcIssuerTypes } from '../payment_config/types.js';

type OverpaymentAllowanceParams = {
  bookingId: string;
  customerId: string;
  issuerType: OidcIssuerTypes;
  locale: string;
};

@Service()
export class OverpaymentAllowanceService {
  @Inject()
  protected paymentConfigService!: PaymentConfigService;

  async getOverpaymentAllowance({
    bookingId,
    customerId,
    issuerType,
    locale,
  }: OverpaymentAllowanceParams) {
    const { settings } = await this.paymentConfigService.getPaymentConfig({ issuerType, locale });

    const { max_amount_exceedance_type = 'none', max_amount_exceedance_value = 0 } = settings;

    if (max_amount_exceedance_type === 'none') {
      return { amount: 0 };
    }

    const booking = await getV3CustomersCustomerIdBookingsBookingId(customerId, bookingId);

    if (issuerType === OidcIssuerTypes.PARTNERS && booking.vendor?.sold_by !== SoldBy.PARTNERS) {
      return { amount: 0 };
    }

    if (max_amount_exceedance_type === 'percent') {
      const totalPrice = booking.total_price?.amount ?? 0;
      return { amount: (totalPrice * (max_amount_exceedance_value || 0)) / 100 };
    }

    return { amount: max_amount_exceedance_value };
  }
}
