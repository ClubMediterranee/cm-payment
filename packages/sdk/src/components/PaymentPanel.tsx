import clsx from 'clsx';
import { type ReactNode, useEffect, useRef } from 'react';
import { useWatch } from 'react-hook-form';

import { Action, PaymentProvider1CategoryPaymentMethod } from '../__generated__/index.schemas';
import type { CapsFormSlots } from '../embed/shared';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext } from '../hooks/utils/useForm';
import { useProviderIntegrationMode } from '../hooks/utils/useProviderIntegrationMode';
import { useWatchedPaymentProvider } from '../hooks/utils/useWatchedPaymentProvider';
import type { CapsFormSchema } from '../schemas/capsFormSchema';
import { TOKENS } from '../types/Tokens';
import { BillingAddress } from './BillingAddress';
import { FormSlot, SubmitSlot } from './CapsPaymentForm/FormSlots';
import { CardInstallments } from './CardInstallments';
import { Cgv } from './Cgv';
import { Comments } from './Comments';
import { ContactChoice } from './ContactChoice';
import { Donation } from './Donation';
import { Step } from './PaymentPanel/Step';
import { FreeDepositField } from './PaymentSchedule/FreeDepositField';
import { PaymentProviders } from './PaymentProviders';
import { PaymentWidget } from './PaymentWidget';
import { SubmitButton } from './SubmitButton';
import { BorderlessFormPanels } from './ui/FormPanel';
import { Title } from './ui/Title';

export type PaymentPanelProps = {
  className?: string;
  reference?: string;
  uuid?: string;
  slots?: CapsFormSlots;
  children?: (props: PaymentPanelRenderProps) => ReactNode;
};

export type PaymentPanelRenderProps = {
  isProviderSelected: boolean;
  deselectProvider: () => void;
};

type PaymentDetailsProps = Pick<PaymentPanelProps, 'reference' | 'uuid' | 'slots'> & {
  isBuyNowPayLater: boolean;
  isPartialPayment: boolean;
};

const PaymentDetails = ({
  reference,
  uuid,
  slots,
  isBuyNowPayLater,
  isPartialPayment,
}: PaymentDetailsProps) => {
  const { content } = useCapsConfigContext();
  const { iframe, custom, hostedField } = useProviderIntegrationMode();
  const cgvFirst = isBuyNowPayLater || iframe || custom;

  const cgv = (
    <Cgv>
      <Title
        as="h4"
        variant="label"
        className={hostedField ? 'hidden md:block' : 'text-center md:text-left'}
      >
        {content.cgv.heading}
      </Title>
    </Cgv>
  );

  return (
    <BorderlessFormPanels value={!isBuyNowPayLater}>
      <div className="flex w-full flex-col gap-40">
        {isPartialPayment && <FreeDepositField />}
        <CardInstallments />
        <BillingAddress>
          <Title as="h4" variant="section" className="text-h5 md:text-h4">
            {content.billingAddress.heading}
          </Title>
        </BillingAddress>
        <ContactChoice reference={reference} uuid={uuid} />
        <Comments>
          <Title as="h4" variant="label">
            {content.comments.heading}
          </Title>
        </Comments>
        <div
          className={clsx(
            'flex w-full flex-col self-center',
            isBuyNowPayLater ? 'gap-40' : 'gap-20 md:max-w-700',
          )}
        >
          {cgvFirst && cgv}
          <PaymentWidget />
          {!cgvFirst && cgv}
        </div>
        <SubmitSlot target={slots?.submit}>
          <SubmitButton className={slots?.submit ? 'w-full' : 'self-center'} />
        </SubmitSlot>
      </div>
    </BorderlessFormPanels>
  );
};

export const PaymentPanel = ({
  className,
  reference,
  uuid,
  slots,
  children,
}: PaymentPanelProps) => {
  const watchedProvider = useWatchedPaymentProvider();
  const { getValues, setValue } = useFormContext();

  const deselectProvider = () => {
    setValue('provider_id', '');
    setValue('payment_condition_id', undefined);
  };

  const isPartialPayment = getValues('action') === Action.PAYMENT_PARTIAL;

  const isBuyNowPayLater =
    watchedProvider?.category_payment_method ===
    PaymentProvider1CategoryPaymentMethod.BuyNowPayLater;

  const amount = useWatch<CapsFormSchema, 'amount'>({ name: 'amount', disabled: isPartialPayment });
  const schedule = isBuyNowPayLater ? watchedProvider?.id : amount;
  const panelRef = useRef<HTMLDivElement>(null);
  const previousSchedule = useRef(schedule);

  useEffect(() => {
    if (schedule && schedule !== previousSchedule.current) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      panelRef.current?.scrollIntoView({
        behavior: reducedMotion ? 'instant' : 'smooth',
        block: 'start',
      });
    }
    previousSchedule.current = schedule;
  }, [schedule]);

  const details = (
    <PaymentDetails
      reference={reference}
      uuid={uuid}
      slots={slots}
      isBuyNowPayLater={isBuyNowPayLater}
      isPartialPayment={isPartialPayment}
    />
  );

  const content = (
    <div className="flex flex-col gap-24">
      <div ref={panelRef} className={clsx('scroll-mt-40', className)}>
        {isBuyNowPayLater ? (
          details
        ) : (
          <PaymentProviders alwaysSelectable={!!children}>{details}</PaymentProviders>
        )}
      </div>
      {children?.({ isProviderSelected: !!watchedProvider, deselectProvider })}
      {!slots?.donation && <Donation />}
    </div>
  );

  return (
    <>
      {isPartialPayment ? content : <Step after="amount">{content}</Step>}
      {slots?.donation && (
        <FormSlot target={slots.donation}>
          <Donation />
        </FormSlot>
      )}
    </>
  );
};

PaymentPanel.Skeleton = PaymentProviders.Skeleton;
PaymentPanel.COMPONENT_KEY = TOKENS.PaymentPanel;
