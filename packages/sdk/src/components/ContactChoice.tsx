import { Radio } from '@clubmed/trident-ui/ui/forms/radios/index';
import clsx from 'clsx';

import { useContactChoice } from '../hooks/useContactChoice';
import { CONTACT_MAPPING, useProfilePrefill } from '../hooks/useProfilePrefill';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext, useWatch } from '../hooks/utils/useForm';
import { TOKENS } from '../types/Tokens';
import { renderTemplate } from '../utils/renderTemplate';
import { RadioSkeleton, TextFieldSkeleton } from './ui/skeletons';
import { ValidatedTextField } from './ui/ValidatedTextField';

type Props = {
  className?: string;
  reference?: string;
  uuid?: string;
};

export const ContactChoice = ({ className, reference, uuid }: Props) => {
  const { content } = useCapsConfigContext();
  const { setValue } = useFormContext();
  const templateId = useWatch('template_id');

  const { contactChoices, shouldDisplay, templateIds } = useContactChoice({
    reference,
    uuid,
  });
  useProfilePrefill(!!shouldDisplay, CONTACT_MAPPING);

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

          return (
            <div
              key={choice.templateId}
              className={clsx(
                'flex min-w-256 flex-1 flex-col gap-16 rounded-32 bg-white p-20',
                isCurrentTemplate
                  ? 'inset-ring-2 inset-ring-black'
                  : 'inset-ring inset-ring-lightGrey',
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
                <span className="font-semibold" data-textid="ContactChoicesLabel">
                  {renderTemplate(content.contactChoice.choiceLabel, {
                    label: choice.radio.label,
                  })}
                </span>
              </Radio>
              {input && field && (
                <ValidatedTextField
                  type={input.type}
                  name={`billing_details.${input.name}`}
                  label={field.label}
                  placeholder={field.placeholder}
                  disabled={!isCurrentTemplate}
                  data-testid={`InputFor_${input.name}`}
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
        className="flex min-w-256 flex-1 flex-col gap-16 rounded-32 bg-white p-20 inset-ring inset-ring-lightGrey"
      >
        <RadioSkeleton />
        <TextFieldSkeleton />
      </div>
    ))}
  </div>
);

ContactChoice.Skeleton = ContactChoiceSkeleton;
ContactChoice.COMPONENT_KEY = TOKENS.ContactChoice;
