import { definePspProvider } from '../../utils/integrations/definePspProvider.js';
import { PspProviders } from '../../types/PspProviders.js';
import { WeChatQRView } from './ui/WeChatQRView.js';

export default definePspProvider({
  id: PspProviders.M99BILLW,
  component: WeChatQRView,
});
