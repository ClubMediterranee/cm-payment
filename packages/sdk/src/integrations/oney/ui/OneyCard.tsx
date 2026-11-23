import type { PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem } from '../../../__generated__/bff/index.schemas.js';
import { InfoButton } from '../../../components/ui/InfoButton.js';
import { ScheduleCard } from '../../../components/PaymentSchedule/ScheduleCard.js';
import { Oney3x } from '../../../components/icons/Oney3x.js';
import { Oney4x } from '../../../components/icons/Oney4x.js';
import { usePaymentSchedule } from '../../../hooks/data/usePaymentSchedule/index.js';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import { useOneySimulationPopin } from '../hooks/useOneySimulationPopin.js';

const ONEY_ICON = {
  '4x': <Oney4x width="2.5rem" />,
  '3x': <Oney3x width="2.5rem" />,
};

type OneyCardProps = {
  provider: PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem;
  checked: boolean;
  onChange: (value: string) => void;
};

export const OneyCard = ({ provider, checked, onChange }: OneyCardProps) => {
  const { content } = useCapsConfigContext();
  const { installments, moreInformation } = content.paymentSchedule;
  const payment_mode = provider.configuration?.settings?.payment_mode;
  const { paymentSchedule } = usePaymentSchedule();
  const { handlePopinClick } = useOneySimulationPopin({
    paymentAmount: Number(paymentSchedule[0]?.amount),
  });

  return (
    <ScheduleCard
      title={installments.cardTitle}
      value={provider.id}
      checked={checked}
      onChange={onChange}
    >
      <div className="flex flex-col items-center gap-4">
        {ONEY_ICON[payment_mode as keyof typeof ONEY_ICON]}
        <div className="flex items-center gap-4 text-b3">
          {installments.cardDescription}
          <InfoButton
            aria-label={`${moreInformation}: ${provider.label}`}
            onClick={handlePopinClick}
          />
        </div>
      </div>
    </ScheduleCard>
  );
};
