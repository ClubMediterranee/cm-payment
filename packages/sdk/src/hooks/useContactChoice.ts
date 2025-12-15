import { useEffect } from 'react';

import { PaymentProvider1CategoryPaymentMethod } from '../__generated__/index.schemas';
import { GLOBAL_CAPS_SETTINGS } from '../config';
import { useCapsConfigContext, useOidcContext } from './utils/useCapsConfigContext';
import { useFormContext, useWatch } from './utils/useForm';
import { useWatchedPaymentProvider } from './utils/useWatchedPaymentProvider';

type UseContactChoiceParams = {
  reference?: string;
  uuid?: string;
};

export const useContactChoice = ({ reference, uuid }: UseContactChoiceParams) => {
  const { templateIds, withContactMethodProviders } = GLOBAL_CAPS_SETTINGS;
  const { content } = useCapsConfigContext();
  const { isSeller } = useOidcContext();
  const { setValue } = useFormContext();
  const watchedTemplateId = useWatch('template_id');
  const watchedPaymentProvider = useWatchedPaymentProvider();

  const isCallRadioDisabled =
    watchedPaymentProvider?.category_payment_method !==
    PaymentProvider1CategoryPaymentMethod.CreditCard;

  useEffect(() => {
    if (watchedTemplateId === templateIds.call && isCallRadioDisabled) {
      setValue('template_id', templateIds.mobilePhone);
    }
  }, [isCallRadioDisabled, watchedTemplateId, setValue, templateIds.call, templateIds.mobilePhone]);

  const shouldDisplay =
    isSeller && withContactMethodProviders.find((id) => watchedPaymentProvider?.id?.includes(id));

  const isOnCall = reference || uuid;

  const contactChoices = [
    {
      templateId: templateIds.mobilePhone,
      input: {
        label: content.contactChoice.choices.mobile_phone,
        name: 'mobile_phone',
        type: 'tel',
      },
      radio: { label: content.contactChoice.choices.mobile_phone },
    },
    {
      templateId: templateIds.email,
      radio: { label: content.contactChoice.choices.email },
      input: { label: content.contactChoice.choices.email, name: 'email', type: 'email' },
    },
    {
      templateId: templateIds.call,
      radio: { label: content.contactChoice.choices.call, disabled: isCallRadioDisabled },
    },
  ].filter((choice) => isOnCall || choice.templateId !== templateIds.call);

  const sendLinkTexts = {
    [templateIds.email]: content.contactChoice.email.sendLink,
    [templateIds.mobilePhone]: content.contactChoice.mobile_phone.sendLink,
    [templateIds.call]: content.contactChoice.call.sendLink,
  };

  const sendLinkText =
    sendLinkTexts[watchedTemplateId as keyof typeof sendLinkTexts] ??
    content.contactChoice.email.sendLink;

  return {
    contactChoices,
    sendLinkText,
    shouldDisplay,
    isCallRadioDisabled,
    templateIds,
  };
};
