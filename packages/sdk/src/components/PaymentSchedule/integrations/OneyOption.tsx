import React from 'react';
import { Icon } from '@clubmed/trident-icons';
import { Radio } from '@clubmed/trident-ui/molecules/Forms/Radios';

import type { PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem } from '../../../__generated__/bff/index.schemas';
import { useBnplSimulation } from '../../../hooks/data/useBnplSimulation';
import { useOneySimulationPopin } from '../../../hooks/integrations/oney/useOneySimulationPopin';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext';
import { useWatch } from '../../../hooks/utils/useForm';
import { formatCurrency } from '../../../utils/formatCurrency';
import { renderTemplate } from '../../../utils/renderTemplate';
import { RadioSkeleton } from '../../ui/skeletons';
import { Oney3x } from '../../icons/Oney3x';
import { Oney4x } from '../../icons/Oney4x';

const ONEY_ICON = { '4x': <Oney4x />, '3x': <Oney3x /> };

type OneyOptionProps = {
  provider: PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem;
  name: string;
  onChange: (value: string) => void;
};

export const OneyOption = ({ provider, name, onChange }: OneyOptionProps) => {
  const {
    content: {
      paymentSchedule: { buyNowPayLater: bnpl },
    },
    locale,
  } = useCapsConfigContext();
  const {
    configuration: {
      settings: { payment_mode },
    },
    id,
  } = provider;
  const amount = Number(useWatch('amount'));
  const currency = useWatch('currency');
  const { handlePopinClick } = useOneySimulationPopin();
  const { data: simulation, isPending } = useBnplSimulation({
    providerId: id as 'EHIPAYBNPL',
    paymentAmount: amount,
    enabled: !!amount,
  });

  const fmt = (value: number) => formatCurrency({ amount: value, currency, locale });
  const sienna = (value: string) => <span className="font-bold text-sienna">{value}</span>;
  const bold = (value: string) => <span className="font-bold">{value}</span>;

  const icon = ONEY_ICON[payment_mode as keyof typeof ONEY_ICON];

  const label = simulation
    ? renderTemplate(bnpl.simulationLabel, {
        icon,
        total: sienna(fmt(amount + simulation.cost)),
        cost: sienna(fmt(simulation.cost)),
        instalments: (
          <>
            {simulation.instalments.map(({ number, amount: instAmount, date }, i) => (
              <React.Fragment key={number}>
                {i > 0 && ', '}
                {renderTemplate(bnpl.instalmentItem, {
                  amount: sienna(fmt(instAmount)),
                  date: bold(new Date(date).toLocaleDateString()),
                })}
              </React.Fragment>
            ))}
          </>
        ),
      })
    : renderTemplate(bnpl.iconLabel, { icon });

  if (isPending) return <RadioSkeleton />;

  return (
    <Radio value={id} name={name} onChange={() => onChange(id)}>
      <div className="flex items-center gap-4">
        {label}
        <button type="button" onClick={handlePopinClick} className="focus:outline-none">
          <Icon name="Information" className="text-sienna font-bold" width="1.5rem" />
        </button>
      </div>
    </Radio>
  );
};
