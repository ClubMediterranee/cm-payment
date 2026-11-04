import { Icon } from '@clubmed/trident-icons';

import type { PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem } from '../../../__generated__/bff/index.schemas.js';
import { ScheduleCard } from '../../../components/PaymentSchedule/ScheduleCard.js';
import { Oney3x } from '../../../components/icons/Oney3x.js';
import { Oney4x } from '../../../components/icons/Oney4x.js';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import { renderTemplate } from '../../../utils/renderTemplate.js';
import { useOneySimulationPopin } from '../hooks/useOneySimulationPopin.js';

const ONEY_ICON = {
  '4x': <Oney4x />,
  '3x': <Oney3x />,
};

type OneyCardProps = {
  provider: PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem;
  name: string;
  checked: boolean;
  onChange: (value: string) => void;
};

export const OneyCard = ({ provider, name, checked, onChange }: OneyCardProps) => {
  const { content } = useCapsConfigContext();
  const payment_mode = provider.configuration?.settings?.payment_mode;
  const { handlePopinClick } = useOneySimulationPopin();

  return (
    <ScheduleCard
      title={renderTemplate(content.paymentSchedule.buyNowPayLater.iconLabel, {
        icon: ONEY_ICON[payment_mode as keyof typeof ONEY_ICON],
      })}
      name={name}
      value={provider.id}
      checked={checked}
      onChange={onChange}
    >
      <button type="button" onClick={handlePopinClick} className="focus:outline-none">
        <Icon name="Information" width="1.5rem" />
      </button>
    </ScheduleCard>
  );
};
