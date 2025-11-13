import { Radio } from '@clubmed/trident-ui/molecules/Forms/Radios';
import { TextField } from '@clubmed/trident-ui/molecules/Forms/TextField';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { renderTemplate } from '../utils/renderTemplate';
import { ErrorMessage } from './ui/ErrorMessage';

type Props = {
  templateId: string;
  radioLabel: string;
  isRadioDisabled?: boolean;
  inputName?: string;
  inputType?: string;
  inputLabel?: string;
};

export const ContactChoiceRadio = ({
  templateId,
  inputLabel,
  inputName,
  inputType,
  radioLabel,
  isRadioDisabled,
}: Props) => {
  const { content } = useCapsConfigContext();
  const { register, setValue, control } = useFormContext();
  const watchedTemplateId = useWatch({ name: 'template_id' });

  const hasTextField = inputLabel || inputName || inputType;

  return (
    <div className="flex flex-col space-y-16 w-full">
      <Radio
        value={templateId}
        disabled={isRadioDisabled}
        {...register('template_id')}
        onChange={(_, value) => setValue('template_id', value || '')}
      >
        <span data-textid="ContactChoicesLabel">
          {renderTemplate(content.contactChoice.choiceLabel, { label: radioLabel })}
        </span>
      </Radio>
      {hasTextField && (
        <Controller
          name={`billing_details.${inputName}`}
          control={control}
          rules={{
            required: {
              value: templateId === watchedTemplateId,
              message: content.contactChoice.validation.required,
            },
          }}
          render={({ field: { value, onChange, ...rest }, fieldState: { error } }) => (
            <>
              <TextField
                {...rest}
                type={inputType}
                value={value}
                onChange={(_, value) => onChange(value)}
                disabled={templateId !== watchedTemplateId}
                data-name={'InputFor_' + inputName}
                data-testid={'InputFor_' + inputName}
                label={inputLabel}
                aria-describedby={inputLabel}
              />
              <ErrorMessage message={error?.message} />
            </>
          )}
        />
      )}
    </div>
  );
};
