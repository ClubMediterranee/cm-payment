import { Icon } from '@clubmed/trident-icons';
import { Radio } from '@clubmed/trident-ui/ui/forms/radios/index';

import type { PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem } from '../../../__generated__/bff/index.schemas.js';
import { useOneySimulationPopin } from '../hooks/useOneySimulationPopin.js';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import { renderTemplate } from '../../../utils/renderTemplate.js';
import { Oney3x } from '../../../components/icons/Oney3x.js';
import { Oney4x } from '../../../components/icons/Oney4x.js';

const ONEY_ICON = {
  '4x': <Oney4x />,
  '3x': <Oney3x />,
};

type OneyOptionProps = {
  provider: PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem;
  name: string;
  onChange: (value: string) => void;
};

export const OneyOption = ({ provider, name, onChange }: OneyOptionProps) => {
  const { content } = useCapsConfigContext();
  const payment_mode = provider.configuration?.settings?.payment_mode;
  const { handlePopinClick } = useOneySimulationPopin();

  return (
    <Radio value={provider.id} name={name} onChange={() => onChange(provider.id)}>
      <div className="flex items-center gap-4">
        {renderTemplate(content.paymentSchedule.buyNowPayLater.iconLabel, {
          icon: ONEY_ICON[payment_mode as keyof typeof ONEY_ICON],
        })}
        <button type="button" onClick={handlePopinClick} className="focus:outline-none">
          <Icon name="Information" className="text-sienna font-bold" width="1.5rem" />
        </button>
      </div>
    </Radio>
  );
};
