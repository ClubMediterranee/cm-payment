import type { Validate } from '../capsFormSchema';

export const validateDonation: Validate = (data, { content }) => {
  if (data.donation_amount && data.donation_amount > 0 && !data.cgv_donation) {
    return {
      path: ['cgv_donation'],
      message: content.donation.acceptCGU,
    };
  }

  return undefined;
};
