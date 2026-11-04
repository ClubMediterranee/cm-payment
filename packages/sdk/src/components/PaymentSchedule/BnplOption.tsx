import type { PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem } from '../../__generated__/bff/index.schemas';
import { PspProviders } from '../../types/PspProviders';
import { OneyCard } from '../../integrations/oney/ui/OneyCard.js';
import { UpliftCard } from '../../integrations/uplift/ui/UpliftCard.js';

const BNPL_OPTION_COMPONENTS = {
  [PspProviders.EHIPAYBNPL]: OneyCard,
  [PspProviders.MUPLIFT]: UpliftCard,
} as const;

type BnplOptionProps = {
  provider: PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem;
  name: string;
  checked: boolean;
  onChange: (value: string) => void;
};

export const BnplOption = ({ provider, name, checked, onChange }: BnplOptionProps) => {
  const OptionComponent =
    BNPL_OPTION_COMPONENTS[provider.id as keyof typeof BNPL_OPTION_COMPONENTS];

  if (OptionComponent) {
    return (
      <OptionComponent provider={provider} name={name} checked={checked} onChange={onChange} />
    );
  }

  return null;
};
