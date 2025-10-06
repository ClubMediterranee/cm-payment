import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Radio, RadioGroup } from '@clubmed/trident-ui/molecules/Forms/Radios';
import { TextField } from '@clubmed/trident-ui/molecules/Forms/TextField';

import { GLOBAL_SDK_SETTINGS } from '../config';
import { useFormContext } from '../hooks/utils/useForm';
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
  contactMethodProviders = GLOBAL_SDK_SETTINGS.withContactMethodProviders,
  choices = GLOBAL_SDK_SETTINGS.contactChoices,
}: Props) => {
  const { register, setValue, watch } = useFormContext();
  const watchedTemplateId = watch('template_id');
  const watchedProviderId = watch('provider_id');
  const displayContactChoice = contactMethodProviders.find((id) =>
    Array.isArray(watchedProviderId) ? watchedProviderId.includes(id) : watchedProviderId === id,
  );

  if (!displayContactChoice) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-16">
      <h2 className="text-h3 font-serif">Quel type de canal ?</h2>

      <RadioGroup className="flex flex-col gap-16" value={watchedTemplateId}>
        {choices.map(({ id, name, type, label }) => {
          return (
            <FormPanel key={id}>
              <div className="flex flex-col space-y-16 w-full">
                <Radio
                  value={id}
                  {...register('template_id')}
                  onChange={(_, value) => setValue('template_id', value || '')}
                >
                  <span data-textid="ContactChoicesLabel">Par {label}</span>
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
                    label={label}
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
