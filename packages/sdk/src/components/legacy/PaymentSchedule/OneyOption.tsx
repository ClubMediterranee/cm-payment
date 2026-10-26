import { Icon } from '@clubmed/trident-icons';
import { Radio } from '@clubmed/trident-ui/ui/forms/radios/index';

import type { PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem } from '../../../__generated__/bff/index.schemas.js';
import { useBnplSimulation } from '../../../hooks/data/useBnplSimulation.js';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import { useWatch } from '../../../hooks/utils/useForm.js';
import { useOneySimulationPopin } from '../../../integrations/oney/hooks/useOneySimulationPopin.js';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { renderTemplate } from '../../../utils/renderTemplate.js';
import { Oney3x } from '../../icons/Oney3x.js';
import { Oney4x } from '../../icons/Oney4x.js';
import { RadioSkeleton } from '../../ui/skeletons/index.js';

const ONEY_ICON = { '4x': <Oney4x />, '3x': <Oney3x /> };
const LINE_BREAK = /\\n|\n/;
const FIRST_INSTALMENT_NUMBER = 0;

type OneyOptionProps = {
  provider: PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem;
  name: string;
  checked: boolean;
  onChange: (value: string) => void;
};

export const OneyOption = ({ provider, name, checked, onChange }: OneyOptionProps) => {
  const {
    content: {
      paymentSchedule: { buyNowPayLater: bnpl },
    },
    locale,
  } = useCapsConfigContext();
  const { id } = provider;
  const paymentMode = provider.configuration?.settings?.payment_mode;
  const amount = Number(useWatch('amount'));
  const currency = useWatch('currency');
  const { handlePopinClick } = useOneySimulationPopin();
  const { data: simulation, isPending } = useBnplSimulation({
    providerId: id as 'EHIPAYBNPL',
    paymentAmount: amount,
    enabled: !!amount,
  });

  if (isPending) return <RadioSkeleton />;

  const [labelTemplate, ...legalParts] = bnpl.iconLabel.split(LINE_BREAK);
  const legalMention = legalParts.join(' ').trim();
  const icon = ONEY_ICON[paymentMode as keyof typeof ONEY_ICON];
  const formatNumber = (value: number) =>
    new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      value,
    );
  const formatDate = (date: string) =>
    new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(date));

  return (
    <>
      <Radio value={id} name={name} checked={checked} onChange={() => onChange(id)}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            {renderTemplate(labelTemplate as typeof bnpl.iconLabel, { icon })}
            <button type="button" onClick={handlePopinClick} className="focus:outline-none">
              <Icon name="Information" className="text-sienna font-bold" width="1.5rem" />
            </button>
          </div>
          {!!legalMention && <span className="text-b6 text-grey">{legalMention}</span>}
        </div>
      </Radio>
      {simulation && (
        <div className="flex gap-10 pb-10">
          <span className="w-24 shrink-0" aria-hidden="true" />
          <div
            className="mt-10 flex w-full flex-col gap-4 border-t border-lightGrey pt-10 text-b5"
            data-testid="oney-instalments"
          >
            {simulation.instalments.map(({ number, amount: instalmentAmount, date }, index) => (
              <div key={number} className="flex items-baseline justify-between gap-8">
                {index
                  ? renderTemplate(bnpl.instalmentOther, {
                      count: index + 1,
                      date: <span className="font-bold text-black">{formatDate(date)}</span>,
                    })
                  : renderTemplate(bnpl.instalmentFirst, {
                      date: <span className="font-bold text-black">{formatDate(date)}</span>,
                    })}
                <span className="flex flex-col items-end text-right">
                  <span className="text-b4 font-bold text-sienna">
                    {formatCurrency({ amount: instalmentAmount, currency, locale })}
                  </span>
                  {number === FIRST_INSTALMENT_NUMBER && !!simulation.cost && (
                    <span className="text-b6 text-grey">
                      {renderTemplate(bnpl.feesInclude, {
                        amount: formatNumber(simulation.cost),
                      })}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
