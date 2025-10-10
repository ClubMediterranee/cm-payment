import type {
  CustomerBookingPaymentSchedule,
  CustomerBookingPaymentScheduleModel,
  DepositRepaymentScheduleModelListV1,
  DepositRepaymentScheduleModelV1,
  PaymentSchedules,
  ProposalPaymentScheduleModelV1,
} from '../../../__generated__';

type MergedScheduleData = {
  currency: string;
  paid?: number;
  total?: number;
  payment_schedules?: PaymentSchedules;
  deposit_repayment_schedule?: DepositRepaymentScheduleModelListV1;
};

type ScheduleItem = CustomerBookingPaymentSchedule | DepositRepaymentScheduleModelV1;

const getAmount = (item: ScheduleItem): number | undefined => {
  if ('expected_payment_amount' in item) return item.expected_payment_amount;
  if ('amount' in item) return item.amount;
  return undefined;
};

export const selectPaymentSchedule = (
  data: CustomerBookingPaymentScheduleModel | ProposalPaymentScheduleModelV1,
) => {
  const mappedSchedule: MergedScheduleData = {
    ...data,
    ...('households' in data ? data.households?.[0] : {}),
  };
  const schedule = [];

  const mappedPaymentSchedule = [
    ...(mappedSchedule.payment_schedules || []),
    ...(mappedSchedule.deposit_repayment_schedule || []),
  ].map((item) => ({
    amount: getAmount(item),
    currency: mappedSchedule.currency,
    deadline: item.deadline,
  }));

  if (!('paid' in data) || !data.paid) {
    schedule.push({
      amount: mappedSchedule.total,
      currency: mappedSchedule.currency,
    });
  }

  if (
    mappedPaymentSchedule?.length > 2 ||
    ('paid' in data && mappedPaymentSchedule?.length === 2)
  ) {
    schedule.push({ ...mappedPaymentSchedule[0] });
  }

  return schedule;
};
