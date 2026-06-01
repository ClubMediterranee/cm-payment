import type { PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem } from '../../__generated__/bff/index.schemas';
import { PspProviders } from '../../types/PspProviders';
import { OneyOption } from './integrations/OneyOption';
import { UpliftOption } from './integrations/UpliftOption';

const BNPL_OPTION_COMPONENTS = {
  [PspProviders.EHIPAYBNPL]: OneyOption,
  [PspProviders.MUPLIFT]: UpliftOption,
} as const;

type BnplOptionProps = {
  provider: PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem;
  name: string;
  onChange: (value: string) => void;
};

export const BnplOption = ({ provider, name, onChange }: BnplOptionProps) => {
  const OptionComponent =
    BNPL_OPTION_COMPONENTS[provider.id as keyof typeof BNPL_OPTION_COMPONENTS];

  if (OptionComponent) {
    return (
      <div className="mt-32">
        <OptionComponent provider={provider} name={name} onChange={onChange} />
      </div>
    );
  }

  return null;
};
