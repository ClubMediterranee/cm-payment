import {
  LegacyBillingAddress,
  LegacyCardInstallments,
  LegacyCgv,
  LegacyComments,
  LegacyContactChoice,
  LegacyDonation,
  LegacyPaymentProviders,
  LegacyPaymentSchedule,
  LegacyPaymentWidget,
  LegacySubmitButton,
} from '../legacy';
import { FormSlot, SubmitSlot } from './FormSlots';
import { type FlowLayoutProps, Title } from './flowShared';

export const LegacyFlow = ({ content, slots, reference, uuid }: FlowLayoutProps) => (
  <>
    <LegacyPaymentSchedule>
      <Title>{content.paymentSchedule.heading}</Title>
    </LegacyPaymentSchedule>
    <LegacyPaymentProviders>
      <Title>{content.paymentProviders.heading}</Title>
    </LegacyPaymentProviders>
    <LegacyCardInstallments>
      <Title>{content.cardInstallments.heading}</Title>
    </LegacyCardInstallments>
    <LegacyContactChoice reference={reference} uuid={uuid}>
      <Title>{content.contactChoice.heading}</Title>
    </LegacyContactChoice>
    <FormSlot target={slots?.donation}>
      <LegacyDonation>
        <Title>{content.donation.heading}</Title>
      </LegacyDonation>
    </FormSlot>
    <LegacyComments>
      <Title>{content.comments.heading}</Title>
    </LegacyComments>
    <LegacyCgv>
      <Title>{content.cgv.heading}</Title>
    </LegacyCgv>
    <LegacyBillingAddress>
      <Title>{content.billingAddress.heading}</Title>
    </LegacyBillingAddress>
    <LegacyPaymentWidget>
      <Title>{content.paymentWidget.heading}</Title>
    </LegacyPaymentWidget>
    <SubmitSlot target={slots?.submit}>
      <LegacySubmitButton className={slots?.submit ? 'w-full' : 'my-8 self-center'}>
        {content.submit.label}
      </LegacySubmitButton>
    </SubmitSlot>
  </>
);
