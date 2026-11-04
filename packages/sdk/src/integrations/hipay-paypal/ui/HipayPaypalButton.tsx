import { PspMountPoint } from '../../../components/ui/PspMountPoint.js';
import { useHipayPaypal } from '../hooks/useHipayPaypal.js';
import integration from '../integration.config.js';

export const HipayPaypalButton = () => {
  useHipayPaypal();

  return <PspMountPoint id={integration.mountPoints.button} className="h-45" />;
};
