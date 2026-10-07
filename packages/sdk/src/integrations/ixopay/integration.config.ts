import { defineIntegration } from '../../utils/integrations/defineIntegration.js';

export default defineIntegration({
  id: 'ixopay',
  mountPoints: {
    cardNumber: 'number',
    cvc: 'cvv',
  },
});
