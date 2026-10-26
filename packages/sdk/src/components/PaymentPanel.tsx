import { Action, PaymentProvider1CategoryPaymentMethod } from '../__generated__/index.schemas';
import type { CapsFormSlots } from '../embed/shared';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext } from '../hooks/utils/useForm';
import { useProviderIntegrationMode } from '../hooks/utils/useProviderIntegrationMode';
import { useWatchedPaymentProvider } from '../hooks/utils/useWatchedPaymentProvider';
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
  const { iframe } = useProviderIntegrationMode();

  return (
    <BorderlessFormPanels value={!isBuyNowPayLater}>
      <div
        data-cgv-first={isBuyNowPayLater || iframe || undefined}
        className="group/panel flex flex-col gap-40"
      >
        {isPartialPayment && <FreeDepositField />}
        <Step after="amount">
          <CardInstallments />
        </Step>
        <Step after="provider_id">
          <BillingAddress>
            <Title className="mb-20 text-center">{content.billingAddress.heading}</Title>
          </BillingAddress>
        </Step>
        <Step
          after={['payment_condition_id', 'billing_details.attendee', 'billing_details.address']}
        >
          <PaymentWidget />
        </Step>
        <Step after="billing_details.address">
          <ContactChoice reference={reference} uuid={uuid} />
        </Step>
        <Step after={['template_id', 'billing_details.mobile_phone', 'billing_details.email']}>
          <Comments>
            <Title variant="label">{content.comments.heading}</Title>
          </Comments>
        </Step>
        <Step after="comments">
          <Cgv className="group-data-cgv-first/panel:-order-1">
            <Title variant="label">{content.cgv.heading}</Title>
          </Cgv>
        </Step>
        <Step>
          <SubmitSlot target={slots?.submit}>
            <SubmitButton className={slots?.submit ? 'w-full' : 'self-center'} />
          </SubmitSlot>
        </Step>
      </div>
    </BorderlessFormPanels>
  );
};

export const PaymentPanel = ({ className, reference, uuid, slots }: PaymentPanelProps) => {
  const watchedProvider = useWatchedPaymentProvider();
  const { getValues } = useFormContext();

  const isPartialPayment = getValues('action') === Action.PAYMENT_PARTIAL;

  const isBuyNowPayLater =
    watchedProvider?.category_payment_method ===
    PaymentProvider1CategoryPaymentMethod.BuyNowPayLater;

  const details = (
    <PaymentDetails
      reference={reference}
      uuid={uuid}
      slots={slots}
      isBuyNowPayLater={isBuyNowPayLater}
      isPartialPayment={isPartialPayment}
    />
  );

  const panel = isBuyNowPayLater ? (
    <div className={className}>{details}</div>
  ) : (
    <PaymentProviders className={className}>{details}</PaymentProviders>
  );

  return (
    <>
      {isPartialPayment ? panel : <Step after="amount">{panel}</Step>}
      {slots?.donation ? (
        <FormSlot target={slots.donation}>
          <Donation />
        </FormSlot>
      ) : (
        <Step after="billing_details.address">
          <Donation />
        </Step>
      )}
    </>
  );
};

PaymentPanel.Skeleton = PaymentProviders.Skeleton;
PaymentPanel.COMPONENT_KEY = TOKENS.PaymentPanel;
