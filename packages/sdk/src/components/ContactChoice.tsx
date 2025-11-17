import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Radio, RadioGroup } from '@clubmed/trident-ui/molecules/Forms/Radios';
import { TextField } from '@clubmed/trident-ui/molecules/Forms/TextField';

import { GLOBAL_CAPS_SETTINGS } from '../config';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext } from '../hooks/utils/useForm';
import { renderTemplate } from '../utils/renderTemplate';
import { FormPanel } from './ui/FormPanel';

type Props = {
  contactMethodProviders?: string[];
  choices?: {
    id: string;
    name: string;
    label: string;
    type: string;
  }[];
};

export const ContactChoice = ({
  contactMethodProviders = GLOBAL_CAPS_SETTINGS.withContactMethodProviders,
  choices = GLOBAL_CAPS_SETTINGS.contactChoices,
}: Props) => {
  const { content } = useCapsConfigContext();
  const { register, setValue, watch } = useFormContext();
  const watchedTemplateId = watch('template_id');
  const watchedProviderId = watch('provider_id');
  const displayContactChoice = contactMethodProviders.find((id) =>
    Array.isArray(watchedProviderId) ? watchedProviderId.includes(id) : watchedProviderId === id,
  );

  if (!displayContactChoice) {
    return null;
  }

  const getContentLabel = (name: string, fallbackLabel: string) => {
    if (name === 'email') return content.contactChoice.choices.email;
    if (name === 'mobile_phone') return content.contactChoice.choices.phone;
    return fallbackLabel;
  };

  return (
    <div className="w-full flex flex-col gap-16">
      <h2 className="text-h3 font-serif">{content.contactChoice.title}</h2>

      <RadioGroup className="flex flex-col gap-16" value={watchedTemplateId}>
        {choices.map(({ id, name, type, label }) => {
          const contentLabel = getContentLabel(name, label);
          return (
            <FormPanel key={id}>
              <div className="flex flex-col space-y-16 w-full">
                <Radio
                  value={id}
                  {...register('template_id')}
                  onChange={(_, value) => setValue('template_id', value || '')}
                >
                  <span data-textid="ContactChoicesLabel">
                    {renderTemplate(content.contactChoice.choiceLabel, { label: contentLabel })}
                  </span>
                </Radio>

                {id === watchedTemplateId && (
                  <TextField
                    type={type}
                    {...register(`billing_details.${name}` as Parameters<typeof register>[0])}
                    data-name={'InputFor_' + name}
                    data-testid={'InputFor_' + name}
                    onChange={(name, value) =>
                      setValue(name as Parameters<typeof setValue>[0], value)
                    }
                    label={contentLabel}
                  />
                )}
              </div>
            </FormPanel>
          );
        })}
      </RadioGroup>
    </div>
  );
};

ContactChoice.COMPONENT_KEY = TOKENS.ContactChoice;
