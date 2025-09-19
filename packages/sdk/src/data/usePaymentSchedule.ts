import { useAppContext } from "../hooks/useAppContext";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules,
  getV1ProposalsProposalIdPaymentSchedule,
} from "../gen";

export const usePaymentSchedule = () => {
  const { id, type, customerId: userId } = useAppContext();

  const getPaymentSchedule = () =>
    type === "booking"
      ? getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules(userId, id, {
          withAuth: true,
        })
      : getV1ProposalsProposalIdPaymentSchedule(id);

  const { data: paymentSchedule } = useSuspenseQuery({
    queryKey: ["paymentSchedule"],
    queryFn: getPaymentSchedule,
    retry: false,
    select: (data) => {
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
