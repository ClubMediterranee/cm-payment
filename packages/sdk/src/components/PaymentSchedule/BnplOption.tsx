import type { PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem } from '../../__generated__/bff/index.schemas';
import { PspProviders } from '../../types/PspProviders';
import { OneyOption } from '../../integrations/oney/ui/OneyOption.js';
import { UpliftOption } from '../../integrations/uplift/ui/UpliftOption.js';

const BNPL_OPTION_COMPONENTS = {
  [PspProviders.EHIPAYBNPL]: OneyOption,
  [PspProviders.MUPLIFT]: UpliftOption,
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
      <div className="mt-32">
        <OptionComponent provider={provider} name={name} checked={checked} onChange={onChange} />
      </div>
    );
  }

  return null;
};
