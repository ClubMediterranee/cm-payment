import { Radio } from '@clubmed/trident-ui/ui/forms/radios/index';
import { TextField } from '@clubmed/trident-ui/ui/forms/TextField';
import clsx from 'clsx';

import { useContactChoice } from '../hooks/useContactChoice';
import { useProfilePrefill } from '../hooks/useProfilePrefill';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext, useWatch } from '../hooks/utils/useForm';
import { TOKENS } from '../types/Tokens';
import { renderTemplate } from '../utils/renderTemplate';
import { RadioSkeleton, TextFieldSkeleton } from './ui/skeletons';

type Props = {
  className?: string;
  reference?: string;
  uuid?: string;
};

export const ContactChoice = ({ className, reference, uuid }: Props) => {
  const { content } = useCapsConfigContext();
  const { setValue, formState } = useFormContext();
  const templateId = useWatch('template_id');
  const billingDetails = useWatch('billing_details') || {};

  const { contactChoices, shouldDisplay, templateIds } = useContactChoice({
    reference,
    uuid,
  });
  useProfilePrefill(!!shouldDisplay);

  if (!shouldDisplay) {
    return null;
  }

  const displayOrder = [templateIds.email, templateIds.mobilePhone, templateIds.call];
  const orderedChoices = [...contactChoices].sort(
    (a, b) => displayOrder.indexOf(a.templateId) - displayOrder.indexOf(b.templateId),
  );

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-20">
        {orderedChoices.map((choice) => {
          const isCurrentTemplate = choice.templateId === templateId;
          const { input } = choice;
          const field = input && content.contactChoice.fields[input.name];
          const fieldError = input && formState.errors.billing_details?.[input.name];
          const isTouched = input && formState.touchedFields.billing_details?.[input.name];

          return (
            <div
              key={choice.templateId}
              className={clsx(
                'flex min-w-256 flex-1 flex-col gap-16 rounded-16 border-2 bg-white p-16',
                isCurrentTemplate ? 'border-black' : 'border-lightGrey',
              )}
            >
              <Radio
                name="template_id"
                value={choice.templateId}
                checked={isCurrentTemplate}
                disabled={!!choice.radio.disabled}
                onChange={() => setValue('template_id', choice.templateId)}
                data-testid={`radio-${choice.templateId}`}
              >
                <span className="font-bold" data-textid="ContactChoicesLabel">
                  {renderTemplate(content.contactChoice.choiceLabel, {
                    label: choice.radio.label,
                  })}
                </span>
              </Radio>
              {input && field && (
                <TextField
                  type={input.type}
                  value={billingDetails[input.name] || ''}
                  onChange={(_, value) =>
                    setValue(`billing_details.${input.name}`, value, {
                      shouldValidate: !!isTouched,
                    })
                  }
                  onBlur={() =>
                    setValue(`billing_details.${input.name}`, billingDetails[input.name] || '', {
                      shouldTouch: true,
                      shouldValidate: true,
                    })
                  }
                  disabled={!isCurrentTemplate}
                  data-name={`InputFor_${input.name}`}
                  data-testid={`InputFor_${input.name}`}
                  label={field.label}
                  placeholder={field.placeholder}
                  errorMessage={fieldError?.message}
                  validationStatus={fieldError ? 'error' : isTouched ? 'success' : 'default'}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ContactChoiceSkeleton = () => (
  <div className="flex w-full flex-wrap gap-20">
    {[1, 2].map((i) => (
      <div
        key={i}
        className="flex min-w-256 flex-1 flex-col gap-16 rounded-16 border-2 border-lightGrey p-16"
      >
        <RadioSkeleton />
        <TextFieldSkeleton />
      </div>
    ))}
  </div>
);

ContactChoice.Skeleton = ContactChoiceSkeleton;
ContactChoice.COMPONENT_KEY = TOKENS.ContactChoice;
