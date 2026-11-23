import React from 'react';
import { Radio } from '@clubmed/trident-ui/ui/forms/radios/index';

import type { PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem } from '../../../__generated__/bff/index.schemas.js';
import { useBnplSimulation } from '../../../hooks/data/useBnplSimulation.js';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import { useWatch } from '../../../hooks/utils/useForm.js';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { renderTemplate } from '../../../utils/renderTemplate.js';
import { Oney3x } from '../../../components/icons/Oney3x.js';
import { Oney4x } from '../../../components/icons/Oney4x.js';
import { InfoButton } from '../../../components/ui/InfoButton.js';
import { RadioSkeleton } from '../../../components/ui/skeletons/index.js';
import { useOneySimulationPopin } from '../hooks/useOneySimulationPopin.js';

const ONEY_ICON = { '4x': <Oney4x />, '3x': <Oney3x /> };

type OneyOptionProps = {
  provider: PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem;
  name: string;
  checked: boolean;
  onChange: (value: string) => void;
};

export const OneyOption = ({ provider, name, checked, onChange }: OneyOptionProps) => {
  const {
    content: {
      paymentSchedule: { monthly, installments, moreInformation },
    },
    locale,
  } = useCapsConfigContext();
  const payment_mode = provider.configuration?.settings?.payment_mode;
  const { id } = provider;
  const amount = Number(useWatch('amount'));
  const currency = useWatch('currency');
  const { handlePopinClick } = useOneySimulationPopin();
  const { data: simulation, isPending } = useBnplSimulation({
    providerId: id as 'EHIPAYBNPL',
    paymentAmount: amount,
    enabled: !!amount,
  });

  const fmt = (value: number) => formatCurrency({ amount: value, currency, locale });
  const sienna = (value: string) => <span className="font-semibold text-sienna">{value}</span>;
  const bold = (value: string) => <span className="font-semibold">{value}</span>;

  const icon = ONEY_ICON[payment_mode as keyof typeof ONEY_ICON];

  const label = simulation
    ? renderTemplate(monthly.simulationLabel, {
        icon,
        total: sienna(fmt(amount + simulation.cost)),
        cost: sienna(fmt(simulation.cost)),
        instalments: (
          <>
            {simulation.instalments.map(({ number, amount: instAmount, date }, i) => (
              <React.Fragment key={number}>
                {i > 0 && ', '}
                {renderTemplate(monthly.instalmentItem, {
                  amount: sienna(fmt(instAmount)),
                  date: bold(new Date(date).toLocaleDateString()),
                })}
              </React.Fragment>
            ))}
          </>
        ),
      })
    : renderTemplate(installments.title, { icon });

  if (isPending) return <RadioSkeleton />;

  return (
    <Radio value={id} name={name} checked={checked} onChange={() => onChange(id)}>
      <div className="flex items-center gap-4">
        {label}
        <InfoButton
          aria-label={`${moreInformation}: ${provider.label}`}
          onClick={handlePopinClick}
          className="text-sienna"
        />
      </div>
    </Radio>
  );
};
