import { ACTION_RESOLVER_QUERY_KEY } from '.';
import { Action } from '../../../__generated__';
import { getCapsConfig } from '../../../providers/CapsConfigProvider';
import { sdkQueryClient } from '../../../providers/QueryClientProvider';
import { daysUntilToday, parseApiDate } from '../../../utils/formatDate';
import { paymentScheduleQueryOptions } from '../usePaymentSchedule';

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
  const { id, type } = getCapsConfig();
  const { enabled, daysBeforeTripToAllowFreeDeposit } = freeDepositConfig;
  if (!enabled) {
    return false;
  }
  await sdkQueryClient.setQueryData(ACTION_RESOLVER_QUERY_KEY(id, type), Action.PAYMENT_PARTIAL);

  let apiDeadline = resortArrivalDate;
  if (daysBeforeTripToAllowFreeDeposit === null) {
    const paymentScheduleOptions = paymentScheduleQueryOptions(id);
    const paymentSchedule = paymentScheduleOptions.select(
      await sdkQueryClient.fetchQuery({
        queryKey: paymentScheduleOptions.queryKey,
        queryFn: paymentScheduleOptions.queryFn as any, // TODO: fix multiple return typing
      }),
    );
    apiDeadline = paymentSchedule[0]?.deadline;
  }

  const deadline = parseApiDate(apiDeadline);
  const isAllowToFreeDeposit =
    deadline && daysUntilToday(deadline) - (daysBeforeTripToAllowFreeDeposit || 0) > 0;
  return !!isAllowToFreeDeposit;
};
