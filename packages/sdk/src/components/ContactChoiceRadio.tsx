import { Radio } from '@clubmed/trident-ui/molecules/Forms/Radios';
import { TextField } from '@clubmed/trident-ui/molecules/Forms/TextField';
import { useEffect } from 'react';
import { Controller, useFormContext, useWatch, ValidationRule } from 'react-hook-form';

import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { renderTemplate } from '../utils/renderTemplate';
import { ErrorMessage } from './ui/ErrorMessage';

type Props = {
  templateId: string;
  input?: {
    name: string;
    type: string;
    label: string;
  };
  radio: {
    label: string;
    disabled?: boolean;
  };
  pattern?: ValidationRule<RegExp>;
};

export const ContactChoiceRadio = ({ templateId, input, radio, pattern }: Props) => {
  const { content } = useCapsConfigContext();
  const { register, setValue, control, clearErrors } = useFormContext();
  const watchedTemplateId = useWatch({ name: 'template_id' });

  const isCurrentTemplate = templateId === watchedTemplateId;
  const hasTextField = !!input;

  useEffect(() => {
    if (!isCurrentTemplate) {
      clearErrors(`billing_details.${input?.name}`);
    }
  }, [isCurrentTemplate]);

  return (
    <div className="flex flex-col space-y-16 w-full">
      <Radio
        value={templateId}
        disabled={!!radio.disabled}
        {...register('template_id')}
        onChange={(_, value) => setValue('template_id', value || '')}
      >
        <span data-textid="ContactChoicesLabel">
          {renderTemplate(content.contactChoice.choiceLabel, { label: radio.label })}
        </span>
      </Radio>
      {hasTextField && (
        <Controller
          name={`billing_details.${input.name}`}
          control={control}
          rules={{
            required: {
              value: isCurrentTemplate,
              message: content.contactChoice.validation.required,
            },
            pattern: isCurrentTemplate ? pattern : undefined,
          }}
          render={({ field: { value, onChange, ...rest }, fieldState: { error } }) => (
            <>
              <TextField
                {...rest}
                type={input.type}
                value={value}
                onChange={(_, value) => onChange(value)}
                disabled={templateId !== watchedTemplateId}
                data-name={'InputFor_' + input.name}
                data-testid={'InputFor_' + input.name}
                label={input.label}
                aria-describedby={input.label}
              />
              <ErrorMessage message={error?.message} />
            </>
          )}
        />
      )}
    </div>
  );
};
