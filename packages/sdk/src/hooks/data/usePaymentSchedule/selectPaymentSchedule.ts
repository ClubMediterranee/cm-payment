import type {
  CartUpgradeRoomModel,
  CustomerBookingPaymentScheduleModel,
  PaymentScheduleModel,
  ProposalPaymentScheduleModelV1,
} from '../../../__generated__';

type PaymentSchedule = {
  currency: string;
  total?: number;
  payment_schedules: Array<{
    amount?: number;
    deadline?: string;
  }>;
};

const isCartUpgradeRoom = (data: any): data is CartUpgradeRoomModel => 'price' in data;

const isProposalSchedule = (data: any): data is ProposalPaymentScheduleModelV1 =>
  'households' in data;

const selectUpgradeSchedule = (data: CartUpgradeRoomModel): PaymentSchedule => {
  return {
    currency: data.price?.currency || '',
    total: data.price?.amount,
    payment_schedules: [{ amount: data.price?.amount, deadline: undefined }],
  };
};

const selectProposalSchedule = (data: ProposalPaymentScheduleModelV1): PaymentSchedule => {
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

const buildScheduleFromMergedData = (data: PaymentSchedule) => {
  const schedule = [];
  const currency = data.currency || '';
  const payments = data.payment_schedules || [];

  if (payments.length < 2) {
    if (payments[0]?.amount !== undefined) {
      schedule.push({
        amount: payments[0].amount,
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
      deadline: payments[0].deadline,
    });
  }
  return schedule;
};

export const selectPaymentSchedule = (
  data:
    | CartUpgradeRoomModel
    | ProposalPaymentScheduleModelV1
    | PaymentScheduleModel
    | CustomerBookingPaymentScheduleModel,
) => {
  let normalizedData: PaymentSchedule;

  if (isCartUpgradeRoom(data)) {
    normalizedData = selectUpgradeSchedule(data);
  } else if (isProposalSchedule(data)) {
    normalizedData = selectProposalSchedule(data);
  } else {
    normalizedData = data as PaymentSchedule;
  }

  return buildScheduleFromMergedData(normalizedData);
};
