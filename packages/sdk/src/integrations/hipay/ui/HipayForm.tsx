import type { HipayField } from '../types/Hipay.js';
import { useHipayHostedFields } from '../hooks/useHipayHostedFields.js';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import { FormPanel } from '../../../components/ui/FormPanel.js';
import { HostedField } from '../../../components/ui/HostedField.js';
import integration from '../integration.config.js';

export const HipayForm = () => {
  const { content } = useCapsConfigContext();
  const { fullName, cardNumber, expiryDate, cvc, hints } = content.creditCardForm;

  const { fields, isReady } = useHipayHostedFields({
    fieldSelectors: integration.mountPoints,
  });

  const fieldProps = (field: HipayField) => ({
    id: integration.mountPoints[field],
    hint: hints[field],
    state: fields[field],
    isLoading: !isReady,
  });

  return (
    <FormPanel className="w-full">
      <div className="flex flex-col gap-20">
        <HostedField {...fieldProps('cardHolder')} label={fullName} />
        <HostedField {...fieldProps('cardNumber')} label={cardNumber} icon="CreditCard" />
        <HostedField {...fieldProps('expiryDate')} label={expiryDate} className="md:w-315" />
        <HostedField {...fieldProps('cvc')} label={cvc} className="md:w-315" />
      </div>
    </FormPanel>
  );
};
