import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { RadioGroup } from '@clubmed/trident-ui/molecules/Forms/Radios';
import { useEffect } from 'react';

import { PaymentProvider1CategoryPaymentMethod } from '../__generated__';
import { GLOBAL_CAPS_SETTINGS } from '../config';
import { useProfilePrefill } from '../hooks/useProfilePrefill';
import { useCapsConfigContext, useOidcContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext, useWatch } from '../hooks/utils/useForm';
import { useWatchedPaymentProvider } from '../hooks/utils/useWatchedPaymentProvider';
import { emailRegex, intlPhoneRegex } from '../utils/regex';
import { ContactChoiceRadio } from './ContactChoiceRadio';
import { FormPanel } from './ui/FormPanel';
import { RadioSkeleton, TextFieldSkeleton, TitleSkeleton } from './ui/skeletons';

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
      templateId: templateIds.mobilePhone,
      input: {
        label: content.contactChoice.choices.mobile_phone,
        name: 'mobile_phone',
        type: 'tel',
      },
      radio: { label: content.contactChoice.choices.mobile_phone },
      pattern: { value: intlPhoneRegex, message: content.contactChoice.mobile_phone.invalid },
    },
    {
      templateId: templateIds.email,
      radio: { label: content.contactChoice.choices.email },
      input: { label: content.contactChoice.choices.email, name: 'email', type: 'email' },
      pattern: { value: emailRegex, message: content.contactChoice.email.invalid },
    },
    {
      templateId: templateIds.call,
      radio: { label: content.contactChoice.choices.call, disabled: isCallRadioDisabled },
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
