import { Icon } from '@clubmed/trident-icons';
import clsx from 'clsx';

import { useCapsConfigContext } from '../../hooks/utils/useCapsConfigContext';

export const PaymentProviderRules = ({ className }: { className?: string }) => {
  const { content } = useCapsConfigContext();

  return (
    <div className={clsx('mb-25 border-sienna p-6 border-1 text-b5', className)}>
      {[
        content.paymentProviders.bankTransfer.security,
        content.paymentProviders.bankTransfer.paymentCap,
      ].map((rule, index) => (
        <div key={index} className="flex items-center py-2">
          <Icon className="text-sienna font-bold" name="CheckDefault" width="1rem" />
          <span className="ms-10">{rule}</span>
        </div>
      ))}
    </div>
  );
};
