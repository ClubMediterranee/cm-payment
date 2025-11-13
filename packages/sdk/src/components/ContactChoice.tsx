import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { RadioGroup } from '@clubmed/trident-ui/molecules/Forms/Radios';
import { useEffect } from 'react';

import { PaymentProvider1CategoryPaymentMethod } from '../__generated__';
import { GLOBAL_CAPS_SETTINGS } from '../config';
import { useProfilePrefill } from '../hooks/useProfilePrefill';
import { useCapsConfigContext, useOidcContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext, useWatch } from '../hooks/utils/useForm';
import { useWatchedPaymentProvider } from '../hooks/utils/useWatchedPaymentProvider';
import { ContactChoiceRadio } from './ContactChoiceRadio';
import { FormPanel } from './ui/FormPanel';

type Props = {
  reference?: string;
  uuid?: string;
};

export const ContactChoice = ({ reference, uuid }: Props) => {
  const { templateIds, withContactMethodProviders } = GLOBAL_CAPS_SETTINGS;

  const { content } = useCapsConfigContext();
  const { setValue } = useFormContext();
  const { isSeller } = useOidcContext();

  const watchedTemplateId = useWatch('template_id');
  const watchedPaymentProvider = useWatchedPaymentProvider();

  useProfilePrefill();

  const isCallRadioDisabled =
    watchedPaymentProvider?.category_payment_method !==
    PaymentProvider1CategoryPaymentMethod.CreditCard;

  useEffect(() => {
    if (watchedTemplateId === templateIds.call && isCallRadioDisabled) {
      setValue('template_id', templateIds.email);
    }
  }, [isCallRadioDisabled, watchedTemplateId]);

  const displayContactChoice =
    isSeller && withContactMethodProviders.find((id) => watchedPaymentProvider?.id?.includes(id));

  if (!displayContactChoice) {
    return null;
  }

  const isOnCall = reference || uuid;

  const sendLinkTexts = {
    [templateIds.email]: content.contactChoice.email.sendLink,
    [templateIds.mobilePhone]: content.contactChoice.mobile_phone.sendLink,
    [templateIds.call]: content.contactChoice.call.sendLink,
  };

  const contactChoices = [
    {
      templateId: templateIds.email,
      inputName: 'email',
      inputType: 'email',
      radioLabel: content.contactChoice.choices.email,
      inputLabel: content.contactChoice.choices.email,
    },
    {
      templateId: templateIds.mobilePhone,
      inputName: 'mobile_phone',
      inputType: 'phone',
      radioLabel: content.contactChoice.choices.mobile_phone,
      inputLabel: content.contactChoice.choices.mobile_phone,
    },
    {
      templateId: templateIds.call,
      radioLabel: content.contactChoice.choices.call,
      isRadioDisabled: isCallRadioDisabled,
    },
  ].filter((choice) => isOnCall || choice.templateId !== templateIds.call);

  return (
    <div className="w-full flex flex-col">
      <h2 className="text-h5 font-serif">{content.contactChoice.title}</h2>
      <FormPanel>
        <span className="text-sienna text-b3 mb-20">
          {sendLinkTexts[watchedTemplateId] ?? content.contactChoice.email.sendLink}
        </span>
        <RadioGroup className="flex flex-row gap-32" value={watchedTemplateId}>
          {contactChoices.map((contactChoice) => (
            <ContactChoiceRadio key={contactChoice.templateId} {...contactChoice} />
          ))}
        </RadioGroup>
      </FormPanel>
    </div>
  );
};

ContactChoice.COMPONENT_KEY = TOKENS.ContactChoice;
