import { Radio } from '@clubmed/trident-ui/ui/forms/radios/index';
import { TextField } from '@clubmed/trident-ui/ui/forms/TextField';
import { PropsWithChildren } from 'react';

import { useContactChoice } from '../hooks/useContactChoice';
import { useProfilePrefill } from '../hooks/useProfilePrefill';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext, useWatch } from '../hooks/utils/useForm';
import { CapsFormSchema } from '../schemas/capsFormSchema';
import { TOKENS } from '../types/Tokens';
import { renderTemplate } from '../utils/renderTemplate';
import { FormPanel } from './ui/FormPanel';
import { RadioSkeleton, TextFieldSkeleton, TitleSkeleton } from './ui/skeletons';

type Props = PropsWithChildren<{
  className?: string;
  reference?: string;
  uuid?: string;
}>;

type TemplateId = CapsFormSchema['template_id'];
type BillingDetailsFieldName = 'email' | 'mobile_phone';

export const ContactChoice = ({ className, reference, uuid, children }: Props) => {
  const { content } = useCapsConfigContext();
  const { setValue, formState } = useFormContext();
  const templateId = useWatch('template_id');
  const billingDetails = useWatch('billing_details') || {};

  const { contactChoices, sendLinkText, shouldDisplay } = useContactChoice({
    reference,
    uuid,
  });
  useProfilePrefill(!!shouldDisplay);

  if (!shouldDisplay) {
    return null;
  }

  const handleTemplateChange = (newTemplateId: TemplateId) => {
    setValue('template_id', newTemplateId);
  };

  return (
    <div className={className}>
      {children}
      <FormPanel>
        <span className="text-sienna text-b3 mb-20">{sendLinkText}</span>
        <div className="flex flex-row gap-32">
          {contactChoices.map((choice) => {
            const isCurrentTemplate = choice.templateId === templateId;
            const hasTextField = !!choice.input;
            const inputName = choice.input?.name as BillingDetailsFieldName | undefined;
            const currentValue = (inputName && billingDetails[inputName]) || '';
            const fieldError = inputName && formState.errors.billing_details?.[inputName];

            return (
              <div key={choice.templateId} className="flex flex-col space-y-16 w-full">
                <Radio
                  key={`radio-${choice.templateId}`}
                  name="template_id"
                  value={choice.templateId}
                  checked={isCurrentTemplate}
                  disabled={!!choice.radio.disabled}
                  onChange={() => handleTemplateChange(choice.templateId)}
                  data-testid={`radio-${choice.templateId}`}
                >
                  <span data-textid="ContactChoicesLabel">
                    {renderTemplate(content.contactChoice.choiceLabel, {
                      label: choice.radio.label,
                    })}
                  </span>
                </Radio>
                {hasTextField && (
                  <TextField
                    type={choice.input.type}
                    value={currentValue}
                    onChange={(_, value) => setValue(`billing_details.${choice.input.name}`, value)}
                    disabled={!isCurrentTemplate}
                    data-name={'InputFor_' + choice.input.name}
                    data-testid={'InputFor_' + choice.input.name}
                    label={choice.input.label}
                    aria-describedby={choice.input.label}
                    errorMessage={fieldError?.message}
                    validationStatus={
                      formState.dirtyFields.billing_details?.[
                        choice.input.name as BillingDetailsFieldName
                      ] && !fieldError
                        ? 'success'
                        : fieldError
                          ? 'error'
                          : 'default'
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      </FormPanel>
    </div>
  );
};

const ContactChoiceSkeleton = () => (
  <div className="w-full flex flex-col gap-16">
    <TitleSkeleton variant="h3" />
    <div className="flex flex-col gap-16">
      {[1, 2].map((i) => (
        <FormPanel key={i}>
          <div className="flex flex-col space-y-16 w-full">
            <RadioSkeleton />
            <TextFieldSkeleton />
          </div>
        </FormPanel>
      ))}
    </div>
  </div>
);

ContactChoice.Skeleton = ContactChoiceSkeleton;
ContactChoice.COMPONENT_KEY = TOKENS.ContactChoice;
