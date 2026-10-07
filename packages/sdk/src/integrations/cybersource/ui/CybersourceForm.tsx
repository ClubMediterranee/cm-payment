import { get } from 'react-hook-form';
import integration from '../integration.config.js';
import { useCybersource } from '../hooks/useCybersource.js';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import { useFormContext } from '../../../hooks/utils/useForm.js';
import { FormPanel } from '../../../components/ui/FormPanel.js';
import { HostedField } from '../../../components/ui/HostedField.js';
import { MonthField } from '../../../components/ui/MonthField.js';

export const CybersourceForm = () => {
  const { content } = useCapsConfigContext();
  const { formState } = useFormContext();

  const fields = {
    cardNumber: {
      selector: integration.mountPoints.cardNumber,
      placeholder: content.creditCardForm.cardNumber,
    },
    cvc: {
      selector: integration.mountPoints.cvc,
      placeholder: content.creditCardForm.cvc,
    },
  };

  const { errors, isReady } = useCybersource({ fields });

  const fieldProps = { isLoading: !isReady };

  return (
    <FormPanel className="w-full">
      <div className="flex flex-wrap gap-28">
        <HostedField
          {...fieldProps}
          error={errors.number}
          label={content.creditCardForm.cardNumber}
          id={fields.cardNumber.selector}
        />

        <div className="w-full flex flex-col md:flex-row gap-28">
          <MonthField
            {...fieldProps}
            label={content.creditCardForm.expiryDate}
            name="creditCard.expiryDate"
            error={get(formState.errors, 'creditCard.expiryDate')?.message}
          />

          <HostedField
            {...fieldProps}
            error={errors.securityCode}
            label={content.creditCardForm.cvc}
            id={fields.cvc.selector}
          />
        </div>
      </div>
    </FormPanel>
  );
};
