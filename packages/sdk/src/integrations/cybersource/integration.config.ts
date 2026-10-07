import { defineIntegration } from '../../utils/integrations/defineIntegration.js';

export default defineIntegration({
  id: 'cybersource',
  mountPoints: {
    cardNumber: 'cybersource-card-number',
    cvc: 'cybersource-card-cvc',
  },
});
