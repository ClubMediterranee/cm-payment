import {useSDKPaymentContext} from "./useSDKPaymentContext.js";
import {useSuspenseQuery} from "@tanstack/react-query";
import {
  getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules,
  getV1ProposalsProposalIdPaymentSchedule,
} from "../__generated__";

export const usePaymentSchedule = () => {
  const {proposalId, bookingId, customerId: userId} = useSDKPaymentContext();

  const getPaymentSchedule = () => {
    if (bookingId) {
      return getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules(userId, bookingId, {
        withAuth: true,
      });
    }

    if (!proposalId) {
      throw new Error("Either bookingId or proposalId must be provided");
    }

    return getV1ProposalsProposalIdPaymentSchedule(proposalId!);
  };

  const {data: paymentSchedule} = useSuspenseQuery({
    queryKey: ["paymentSchedule"],
    queryFn: getPaymentSchedule,
    retry: false,
    select: (data: any) => {
      // TODO supprimer le any et lancer le type checking
      const mappedSchedule: any = {
        ...data,
        // TODO Jerome, tu pourras check cette implementation
        ...(data as any).households?.[0],
      };
      const schedule = [];

      const mappedPaymentSchedule = [
        ...(mappedSchedule.payment_schedules || []),
        ...(mappedSchedule.deposit_repayment_schedule || []),
      ].map(({expected_payment_amount, deadline, amount}) => ({
        amount: expected_payment_amount || amount,
        currency: mappedSchedule.currency,
        deadline,
      }));

      if (!("paid" in data) || !data.paid) {
        schedule.push({
          amount: mappedSchedule.total,
          currency: mappedSchedule.currency,
        });
      }

      if (
        mappedPaymentSchedule?.length > 1 ||
        ("paid" in data && mappedPaymentSchedule?.length === 1)
      ) {
        schedule.push({...mappedPaymentSchedule[0]});
      }

      return schedule;
    },
  });

  return {paymentSchedule};
};
