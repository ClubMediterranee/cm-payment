import { defineIntegration } from '../../utils/integrations/defineIntegration.js';

export default defineIntegration({
  id: 'hipay-paypal',
  mountPoints: {
    button: 'paypal-button',
  },
});
