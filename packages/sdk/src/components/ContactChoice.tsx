import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Icon, type IconicNames } from '@clubmed/trident-icons';
import { Card } from '@clubmed/trident-ui/molecules/Card';
import { Checkbox, Checkboxes } from '@clubmed/trident-ui/molecules/Forms/Checkboxes';
import { TextField } from '@clubmed/trident-ui/molecules/Forms/TextField';
import { useFormContext } from 'react-hook-form';

import { GLOBAL_SDK_SETTINGS } from '../config';

type Props = {
  contactMethodProviders?: string[];
  choices?: {
    id: string;
    name: string;
    label: string;
    type: string;
    icon: IconicNames;
  }[];
};

export const ContactChoice = ({
  contactMethodProviders = GLOBAL_SDK_SETTINGS.withContactMethodProviders,
  choices = GLOBAL_SDK_SETTINGS.contactChoices,
}: Props) => {
  const { register, setValue, watch } = useFormContext();
  const watchedTemplateId = watch('template_id');
  const watchedProviderId = watch('provider_id');
  const displayContactChoice = contactMethodProviders.find((id) => watchedProviderId?.includes(id));

  if (!displayContactChoice) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-16">
      <h2 className="text-h3 font-serif">Quel type de canal ?</h2>

      <Checkboxes className="flex flex-col gap-16">
        {choices.map(({ id, name, type, icon, label }) => {
          const isChecked = id === watchedTemplateId;
          return (
            <Card title="" key={id} icon={icon as keyof typeof Icon}>
              <div className="flex flex-col space-y-16 w-full">
                <Checkbox
                  value={id}
                  {...register('template_id')}
                  onChange={setValue}
                  checked={isChecked}
                >
                  <span data-textid="ContactChoicesLabel">Par {label}</span>
                </Checkbox>

                {isChecked && (
                  <TextField
                    type={type}
                    {...register(`billing_details.${name}`)}
                    data-name={'InputFor_' + name}
                    data-testid={'InputFor_' + name}
                    onChange={setValue}
                    label={label}
                  />
                )}
              </div>
            </Card>
          );
        })}
      </Checkboxes>
    </div>
  );
};

ContactChoice.COMPONENT_KEY = TOKENS.ContactChoice;
