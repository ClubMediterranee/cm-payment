import { Service } from '@tsed/di';
import {
  Action,
  CartUpgradeRoomModel,
  CustomerBookingPaymentScheduleModel,
  PaymentScheduleModel,
  ProposalPaymentScheduleModelV1,
} from 'src/infra/api/__generated__/index.schemas.js';

import {
  getV0CustomersCustomerIdBookingsBookingIdCartAccommodations,
  getV0CustomersCustomerIdBookingsBookingIdCartPaymentSchedule,
  getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules,
  getV1ProposalsProposalIdPaymentSchedule,
} from '../infra/api/__generated__/index.js';

type PaymentSchedule = {
  currency: string;
  total?: number;
  payment_schedules: Array<{
    amount?: number;
    deadline?: string;
  }>;
};
type PaymentType = 'booking' | 'proposal';

@Service()
export class PaymentSchedulesService {
  async handlePaymentSchedules(params: Record<string, any>) {
    const { type, proposal_id, customer_id, action } = params;

    let response:
      | ProposalPaymentScheduleModelV1
      | CustomerBookingPaymentScheduleModel
      | PaymentScheduleModel
      | CartUpgradeRoomModel;

    if (!proposal_id) {
      throw new Error('proposal id is required for this action');
    }

    if ((type as PaymentType) === 'proposal') {
      response = await this.proposalIdPaymentSchedule(proposal_id);
    } else {
      if (!customer_id) {
        throw new Error('customer id is required for this action');
      }
      switch (action as Action) {
        case Action.PAYMENT_OPTION:
        case Action.PAYMENT_SOLDE:
        case Action.PAYMENT_PARTIAL:
          response = await this.bookingIdpaymentSchedules(customer_id!, proposal_id);
          break;

        case Action.PAYMENT_CART:
          response = await this.bookingIdcartPaymentSchedule(customer_id!, proposal_id);
          break;

        case Action.PAYMENT_UPGRADE_ROOM:
          response = await this.bookingIdCartAccommodations(customer_id!, proposal_id);
          break;

        default:
          throw new Error('Invalid action');
      }
    }

    let normalizedData: PaymentSchedule;

    if (this.isCartUpgradeRoom(response)) {
      normalizedData = this.selectUpgradeSchedule(response as CartUpgradeRoomModel);
    } else if (this.isProposalSchedule(response)) {
      normalizedData = this.selectProposalSchedule(response as ProposalPaymentScheduleModelV1);
    } else {
      normalizedData = response as PaymentSchedule;
    }

    const paymentSchedules = this.buildScheduleFromMergedData(normalizedData);

    if (!paymentSchedules.length) {
      throw new Error('No payment schedule found');
    }
    return paymentSchedules;
  }

  private async proposalIdPaymentSchedule(
    proposal_id: string,
  ): Promise<ProposalPaymentScheduleModelV1> {
    return await getV1ProposalsProposalIdPaymentSchedule(proposal_id);
  }

  private async bookingIdpaymentSchedules(
    customer_id: string,
    proposal_id: string,
  ): Promise<CustomerBookingPaymentScheduleModel> {
    return await getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules(
      customer_id,
      proposal_id,
    );
  }

  private async bookingIdcartPaymentSchedule(
    customer_id: string,
    proposal_id: string,
  ): Promise<PaymentScheduleModel> {
    return await getV0CustomersCustomerIdBookingsBookingIdCartPaymentSchedule(
      customer_id,
      proposal_id,
    );
  }

  private async bookingIdCartAccommodations(
    customer_id: string,
    proposal_id: string,
  ): Promise<CartUpgradeRoomModel> {
    return await getV0CustomersCustomerIdBookingsBookingIdCartAccommodations(
      customer_id,
      proposal_id,
    );
  }

  private isCartUpgradeRoom = (data: any): data is CartUpgradeRoomModel => 'price' in data;

  private isProposalSchedule = (data: any): data is ProposalPaymentScheduleModelV1 =>
    'households' in data;

  private selectUpgradeSchedule = (data: CartUpgradeRoomModel): PaymentSchedule => {
    return {
      currency: data.price?.currency || '',
      total: data.price?.amount,
      payment_schedules: [{ amount: data.price?.amount, deadline: undefined }],
    };
  };

  private selectProposalSchedule = (data: ProposalPaymentScheduleModelV1): PaymentSchedule => {
    const household = data.households?.[0];
    return {
      currency: data.currency || 'EUR',
      total: household?.total,
      payment_schedules: (household?.deposit_repayment_schedule || []).map((item) => ({
        amount: item.expected_payment_amount,
        deadline: item.deadline || undefined,
      })),
    };
  };

  private buildScheduleFromMergedData = (
    data: PaymentSchedule,
  ): Array<{ amount?: number; currency: string; deadline?: string; balance?: number }> => {
    const schedule = [];
    const currency = data.currency || '';
    const payments = data.payment_schedules || [];

    if (payments.length < 2) {
      if (payments[0]?.amount !== undefined) {
        schedule.push({
          amount: payments[0].amount,
          deadline: payments[0].deadline,
          currency,
        });
      }
      return schedule;
    }

    schedule.push({
      amount: data.total,
      currency,
    });

    if (payments[0]?.amount !== undefined) {
      schedule.push({
        amount: payments[0].amount,
        currency,
        deadline: payments[1].deadline,
        balance: payments[1].amount,
      });
    }
    return schedule;
  };
}
