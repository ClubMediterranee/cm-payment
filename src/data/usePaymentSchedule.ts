import { useAppContext } from "../hooks/useAppContext";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useUserId } from "../hooks/useUserId";
import {
  CustomerBookingPaymentSchedule,
  getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules,
  getV1ProposalsProposalIdPaymentSchedule,
  ProposalPaymentScheduleModelV1,
} from "../api";

export const usePaymentSchedule = () => {
  const { id, type } = useAppContext();
  const userId = useUserId();

  const getPaymentSchedule = () =>
    type === "booking"
      ? getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules(userId, id)
      : getV1ProposalsProposalIdPaymentSchedule(id);

  const { data: paymentSchedule } = useSuspenseQuery({
    queryKey: ["paymentSchedule"],
    queryFn: getPaymentSchedule,
    retry: false,
    select: (
      data: CustomerBookingPaymentSchedule | ProposalPaymentScheduleModelV1
    ) => {
      const mappedSchedule = {
        ...data,
        ...data.households?.[0],
      };
      const schedule = [];

      const mappedPaymentSchedule = [
        ...(mappedSchedule.payment_schedules || []),
        ...(mappedSchedule.deposit_repayment_schedule || []),
      ].map(({ expected_payment_amount, deadline, amount }) => ({
        amount: expected_payment_amount || amount,
        currency: mappedSchedule.currency,
        deadline,
      }));

      if (!data.paid) {
        schedule.push({
          amount: mappedSchedule.total,
          currency: mappedSchedule.currency,
        });
      }

      if (
        mappedPaymentSchedule?.length > 1 ||
        (data.paid && mappedPaymentSchedule?.length === 1)
      ) {
        schedule.push({ ...mappedPaymentSchedule[0] });
      }

      return schedule;
    },
  });

  return { paymentSchedule };
};
