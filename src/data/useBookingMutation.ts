import { useMutation } from "@tanstack/react-query";
import { postV3Bookings } from "../api";

export const useBookingMutation = () => {
  return useMutation({
    mutationKey: ["postBooking"],
    mutationFn: postV3Bookings,
  });
};
