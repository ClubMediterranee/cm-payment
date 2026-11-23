import { useIxopayHostedFields } from '../hooks/useIxopayHostedFields.js';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import { FormPanel } from '../../../components/ui/FormPanel.js';
import { HostedField } from '../../../components/ui/HostedField.js';
import { MonthField } from '../../../components/ui/MonthField.js';
import { ValidatedTextField } from '../../../components/ui/ValidatedTextField.js';
import integration from '../integration.config.js';

export const IxopayForm = () => {
  const { content } = useCapsConfigContext();
  const { fullName, cardNumber, expiryDate, cvc, placeholders, hints } = content.creditCardForm;

  const { isReady, fields } = useIxopayHostedFields({
    fieldSelectors: integration.mountPoints,
  });

  const isLoading = !isReady;

  return (
    <FormPanel className="w-full">
      <div className="flex flex-col gap-20">
        <ValidatedTextField
          name="creditCard.cardHolder"
          label={fullName}
          placeholder={placeholders.cardHolder}
          hint={hints.cardHolder}
          autoComplete="cc-name"
        />

        <HostedField
          id={integration.mountPoints.cardNumber}
          label={cardNumber}
          hint={hints.cardNumber}
          state={fields.number}
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
          id={integration.mountPoints.cvc}
          label={cvc}
          hint={hints.cvc}
          state={fields.cvv}
          isLoading={isLoading}
          className="md:w-315"
        />
      </div>
    </FormPanel>
  );
};
