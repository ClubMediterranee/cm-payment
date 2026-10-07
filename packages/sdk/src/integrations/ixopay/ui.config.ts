import { definePspProvider } from '../../utils/integrations/definePspProvider.js';
import { PspProviders } from '../../types/PspProviders.js';
import { IxopayForm } from './ui/IxopayForm.js';

export default definePspProvider({
  id: PspProviders.EIXOPAY,
  component: IxopayForm,
});
