import { TextField } from '@clubmed/trident-ui/molecules/Forms/TextField';
import { Controller, get } from 'react-hook-form';

import { useIxopayHostedFields } from '../hooks/useIxopayHostedFields.js';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import { useFormContext } from '../../../hooks/utils/useForm.js';
import { FormPanel } from '../../../components/ui/FormPanel.js';
import { HostedField } from '../../../components/ui/HostedField.js';
import { MonthField } from '../../../components/ui/MonthField.js';
import integration from '../integration.config.js';

export const IxopayForm = () => {
  const { content } = useCapsConfigContext();
  const { formState, control } = useFormContext();

  const { isReady, errors } = useIxopayHostedFields({
    fieldSelectors: integration.mountPoints,
  });

  const fieldProps = { isLoading: !isReady };

  return (
    <FormPanel className="w-full">
      <div className="flex flex-wrap gap-28">
        <Controller
          name="creditCard.cardHolder"
          control={control}
          render={({ field: { value, onChange, name }, fieldState: { error } }) => (
            <div className="w-full flex flex-col gap-6">
              <span className="font-semibold px-20">{content.creditCardForm.fullName}</span>
              <TextField
                {...fieldProps}
                name={name}
                placeholder={content.creditCardForm.fullName}
                value={value || ''}
                onChange={(_: unknown, val: string) => onChange(val)}
                errorMessage={error?.message}
                validationStatus={error ? 'error' : 'default'}
              />
            </div>
          )}
        />

        <HostedField
          {...fieldProps}
          label={content.creditCardForm.cardNumber}
          id={integration.mountPoints.cardNumber}
          error={errors.number}
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
            label={content.creditCardForm.cvc}
            id={integration.mountPoints.cvc}
            error={errors.cvv}
          />
        </div>
      </div>
    </FormPanel>
  );
};
