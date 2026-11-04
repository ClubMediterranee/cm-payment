import { defineIntegration } from '../../utils/integrations/defineIntegration.js';

export default defineIntegration({
  id: 'hipay',
  mountPoints: {
    cardHolder: 'hipay-card-holder',
    cardNumber: 'hipay-card-number',
    expiryDate: 'hipay-card-expiry',
    cvc: 'hipay-card-cvc',
  },
});
