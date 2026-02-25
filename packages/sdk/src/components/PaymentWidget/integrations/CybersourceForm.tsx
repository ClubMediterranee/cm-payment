import { get } from 'react-hook-form';

import { useCybersource } from '../../../hooks/integrations/cybersource/useCybersource';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext';
import { useFormContext } from '../../../hooks/utils/useForm';
import { FormPanel } from '../../ui/FormPanel';
import { HostedField } from '../../ui/HostedField';
import { MonthField } from '../../ui/MonthField';

export const CybersourceForm = () => {
  const { content } = useCapsConfigContext();
  const { formState } = useFormContext();

  const fields = {
    cardNumber: {
      selector: 'cybersource-card-number',
      placeholder: content.creditCardForm.cardNumber,
    },
    cvc: {
      selector: 'cybersource-card-cvc',
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
