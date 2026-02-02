import { Radio } from '@clubmed/trident-ui/molecules/Forms/Radios';
import { TextField } from '@clubmed/trident-ui/molecules/Forms/TextField';
import { Controller } from 'react-hook-form';

import { useContactChoice } from '../hooks/useContactChoice';
import { useProfilePrefill } from '../hooks/useProfilePrefill';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext } from '../hooks/utils/useForm';
import { TOKENS } from '../types/Tokens';
import { renderTemplate } from '../utils/renderTemplate';
import { FormPanel } from './ui/FormPanel';
import { RadioSkeleton, TextFieldSkeleton, TitleSkeleton } from './ui/skeletons';

type Props = {
  reference?: string;
  uuid?: string;
};

export const ContactChoice = ({ reference, uuid }: Props) => {
  const { content } = useCapsConfigContext();
  const { control } = useFormContext();

  useProfilePrefill();
  const { contactChoices, sendLinkText, shouldDisplay } = useContactChoice({
    reference,
    uuid,
  });

  if (!shouldDisplay) {
    return null;
  }

  return (
    <div className="w-full flex flex-col">
      <h2 className="text-h5 font-serif">{content.contactChoice.title}</h2>
      <FormPanel>
        <span className="text-sienna text-b3 mb-20">{sendLinkText}</span>
        <Controller
          name="template_id"
          control={control}
          render={({ field: { value, onChange, name } }) => (
            <div className="flex flex-row gap-32">
              {contactChoices.map((choice) => {
                const isCurrentTemplate = choice.templateId === value;
                const hasTextField = !!choice.input;

                return (
                  <div key={choice.templateId} className="flex flex-col space-y-16 w-full">
                    <Radio
                      key={`${isCurrentTemplate}`}
                      name={name}
                      value={choice.templateId}
                      checked={isCurrentTemplate}
                      disabled={!!choice.radio.disabled}
                      onChange={(_, newValue) => onChange(newValue || '')}
                    >
                      <span data-textid="ContactChoicesLabel">
                        {renderTemplate(content.contactChoice.choiceLabel, {
                          label: choice.radio.label,
                        })}
                      </span>
                    </Radio>
                    {hasTextField && (
                      <Controller
                        name={`billing_details.${choice.input.name}` as any}
                        control={control}
                        render={({
                          field: { value, onChange, ...rest },
                          fieldState: { error, isTouched },
                        }) => (
                          <TextField
                            {...rest}
                            type={choice.input.type}
                            value={value}
                            onChange={(_, value) => onChange(value)}
                            disabled={!isCurrentTemplate}
                            data-name={'InputFor_' + choice.input.name}
                            data-testid={'InputFor_' + choice.input.name}
                            label={choice.input.label}
                            aria-describedby={choice.input.label}
                            errorMessage={error?.message}
                            validationStatus={
                              isTouched && !error ? 'success' : error ? 'error' : 'default'
                            }
                          />
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        />
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
