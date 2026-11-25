import { definePspProvider } from '../../utils/integrations/definePspProvider.js';
import { PspProviders } from '../../types/PspProviders.js';
import { WeChatButton } from './ui/WeChatButton.js';
import { WeChatQRView } from './ui/WeChatQRView.js';

definePspProvider({
  id: PspProviders.M99BILLW,
  kind: 'button',
  component: WeChatButton,
});

export default definePspProvider({
  id: PspProviders.M99BILLW,
  component: WeChatQRView,
});
