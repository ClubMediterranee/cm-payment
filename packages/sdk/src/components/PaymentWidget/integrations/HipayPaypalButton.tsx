import { useHipayPaypal } from '../../../hooks/integrations/hipay/useHipayPaypal';

export const HipayPaypalButton = () => {
  useHipayPaypal();

  return <div id="paypal-button" className="h-45"></div>;
};
