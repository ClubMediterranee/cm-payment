import { Action } from '../../../__generated__/index.schemas';
import { getPaymentConfig } from '../../../providers/PaymentConfigProvider';
import { sdkQueryClient } from '../../../providers/QueryClientProvider';
import { daysUntilToday, parseApiDate } from '../../../utils/formatDate';
import { paymentScheduleQueryOptions } from '../usePaymentSchedule';
import { ACTION_RESOLVER_QUERY_KEY } from './';

export type CheckFreeDepositAuthorizationArgs = {
  freeDepositConfig: {
    enabled: boolean;
    daysBeforeTripToAllowFreeDeposit: number | null;
  };
  resortArrivalDate?: string;
};

export const checkFreeDepositAuthorization = async ({
  resortArrivalDate,
  freeDepositConfig,
}: CheckFreeDepositAuthorizationArgs) => {
  const { id, type, customerId } = getPaymentConfig();
  const { enabled, daysBeforeTripToAllowFreeDeposit } = freeDepositConfig;
  if (!enabled) {
    return false;
  }
  await sdkQueryClient.setQueryData(ACTION_RESOLVER_QUERY_KEY(id, type), Action.PAYMENT_PARTIAL);

  let apiDeadline = resortArrivalDate;
  if (daysBeforeTripToAllowFreeDeposit === null) {
    const paymentScheduleOptions = paymentScheduleQueryOptions(id, type, customerId);
    const paymentSchedule = await sdkQueryClient.fetchQuery(paymentScheduleOptions);
    apiDeadline = paymentSchedule[0]?.deadline;
  }

  const deadline = parseApiDate(apiDeadline);
  const isAllowToFreeDeposit =
    deadline && daysUntilToday(deadline) - (daysBeforeTripToAllowFreeDeposit || 0) > 0;
  return !!isAllowToFreeDeposit;
};
