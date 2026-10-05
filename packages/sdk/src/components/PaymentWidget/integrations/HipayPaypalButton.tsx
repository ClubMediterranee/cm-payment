import { PSP_MOUNT_POINTS } from '../../../utils/integrations/pspMountPoints';
import { PspMountPoint } from '../../ui/PspMountPoint';
import { useHipayPaypal } from '../../../hooks/integrations/hipay/useHipayPaypal';

export const HipayPaypalButton = () => {
  useHipayPaypal();

  return <PspMountPoint id={PSP_MOUNT_POINTS.hipayPaypal.button} className="h-45" />;
};
