import { useEffect } from 'react';
import integration from '../integration.config.js';

import { PspMountPoint } from '../../../components/ui/PspMountPoint.js';

export const UpliftForm = () => {
  useEffect(() => {
    if (!window.Uplift) return;
    window.Uplift.Payments.select();

    return () => {
      window.Uplift?.Payments.deselect();
    };
  }, []);

  return <PspMountPoint id={integration.mountPoints.container} className="w-full mt-24" />;
};
