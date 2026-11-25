import { Service } from '@tsed/di';

import {
  Action,
  GetPaymentSchedulesV1Model,
  ProposalPaymentScheduleModelV1,
} from '../../infra/api/__generated__/index.js';
import { ApiResponse, PaymentSchedule } from './types.js';

const SINGLE_PAYMENT_ACTIONS: Action[] = [
  Action.PAYMENT_CART,
  Action.PAYMENT_UPGRADE_ROOM,
  Action.PAYMENT_SERVICES_IN_OPTION,
];

@Service()
export class PaymentScheduleNormalizer {
  normalize(response: ApiResponse, action: Action): PaymentSchedule {
    if (this.isProposalSchedule(response)) {
      return this.normalizeProposalSchedule(response);
    }

    return this.normalizeBookingSchedule(response, action);
  }

  private isProposalSchedule(data: ApiResponse): data is ProposalPaymentScheduleModelV1 {
    return 'households' in data && Array.isArray(data.households);
  }

  private normalizeBookingSchedule(
    data: GetPaymentSchedulesV1Model,
    action: Action,
  ): PaymentSchedule {
    const amount = data.amount ?? data.total ?? undefined;

    return {
      currency: data.currency,
      total: amount,
      payment_schedules: SINGLE_PAYMENT_ACTIONS.includes(action)
        ? [{ amount }]
        : data.payment_schedules.map((schedule) => ({
            amount: schedule.amount ?? undefined,
            deadline: schedule.deadline ?? undefined,
          })),
    };
  }

  private normalizeProposalSchedule(data: ProposalPaymentScheduleModelV1) {
    const household = data.households?.[0];

    return {
      currency: data.currency || 'EUR',
      total: household?.total,
      payment_schedules: (household?.deposit_repayment_schedule || []).map((item) => ({
        amount: item.expected_payment_amount,
        deadline: item.deadline || undefined,
      })),
    };
  }
}
