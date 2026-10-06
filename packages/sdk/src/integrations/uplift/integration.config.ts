import { defineIntegration } from '../../utils/integrations/defineIntegration.js';

export default defineIntegration({
  id: 'uplift',
  mountPoints: {
    container: 'uplift-container',
  },
});
