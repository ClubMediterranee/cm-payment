import integration from '../integration.config.js';
import { useCybersource } from '../hooks/useCybersource.js';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import { FormPanel } from '../../../components/ui/FormPanel.js';
import { HostedField } from '../../../components/ui/HostedField.js';
import { MonthField } from '../../../components/ui/MonthField.js';

export const CybersourceForm = () => {
  const { content } = useCapsConfigContext();
  const { cardNumber, expiryDate, cvc, placeholders, hints } = content.creditCardForm;

  const fields = {
    cardNumber: {
      selector: integration.mountPoints.cardNumber,
      placeholder: placeholders.cardNumber,
    },
    cvc: { selector: integration.mountPoints.cvc, placeholder: placeholders.cvc },
  };

  const { fields: states, isReady } = useCybersource({ fields });

  const isLoading = !isReady;

  return (
    <FormPanel className="w-full">
      <div className="flex flex-col gap-20">
        <HostedField
          id={fields.cardNumber.selector}
          label={cardNumber}
          hint={hints.cardNumber}
          state={states.cardNumber}
          isLoading={isLoading}
          icon="CreditCard"
        />

        <MonthField
          label={expiryDate}
          placeholder={placeholders.expiryDate}
          hint={hints.expiryDate}
          isLoading={isLoading}
          className="md:w-315"
        />

        <HostedField
          id={fields.cvc.selector}
          label={cvc}
          hint={hints.cvc}
          state={states.cvc}
          isLoading={isLoading}
          className="md:w-315"
        />
      </div>
    </FormPanel>
  );
};
