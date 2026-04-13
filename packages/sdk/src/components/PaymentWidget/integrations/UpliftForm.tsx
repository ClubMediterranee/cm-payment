import { useEffect } from 'react';

export const UpliftForm = () => {
  useEffect(() => {
    if (!window.Uplift) return;
    window.Uplift.Payments.select();

    return () => {
      window.Uplift?.Payments.deselect();
    };
  }, []);

  return <div id="uplift-container" className="w-full mt-24" />;
};
