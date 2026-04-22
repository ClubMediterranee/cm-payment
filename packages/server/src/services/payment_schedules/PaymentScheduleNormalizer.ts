import { Service } from '@tsed/di';

import {
  CartUpgradeRoomModel,
  ProposalPaymentScheduleModelV1,
} from '../../infra/api/__generated__/index.schemas.js';
import { ApiResponse, PaymentSchedule } from './types.js';

@Service()
export class PaymentScheduleNormalizer {
  normalize(response: ApiResponse): PaymentSchedule {
    if (this.isCartUpgradeRoom(response)) {
      return this.normalizeUpgradeSchedule(response);
    }

    if (this.isProposalSchedule(response)) {
      return this.normalizeProposalSchedule(response);
    }

    return response as PaymentSchedule;
  }

  private isCartUpgradeRoom(data: any): data is CartUpgradeRoomModel {
    return data?.price?.amount !== undefined;
  }

  private isProposalSchedule(data: any): data is ProposalPaymentScheduleModelV1 {
    return Array.isArray(data?.households);
  }

  private normalizeUpgradeSchedule(data: CartUpgradeRoomModel): PaymentSchedule {
    return {
      currency: data.price?.currency || '',
      total: data.price?.amount,
      payment_schedules: [
        {
          amount: data.price?.amount,
          deadline: undefined,
        },
      ],
    };
  }

  private normalizeProposalSchedule(data: ProposalPaymentScheduleModelV1): PaymentSchedule {
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
