import { useEffect } from 'react';

import { PSP_MOUNT_POINTS } from '../../../utils/integrations/pspMountPoints';
import { PspMountPoint } from '../../ui/PspMountPoint';

export const UpliftForm = () => {
  useEffect(() => {
    if (!window.Uplift) return;
    window.Uplift.Payments.select();

    return () => {
      window.Uplift?.Payments.deselect();
    };
  }, []);

  return <PspMountPoint id={PSP_MOUNT_POINTS.uplift.container} className="w-full mt-24" />;
};
