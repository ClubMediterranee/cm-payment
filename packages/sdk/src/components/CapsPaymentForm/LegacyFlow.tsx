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
import { type FlowLayoutProps, SubmitLabel, Title } from './flowShared';

export const LegacyFlow = ({ slots, reference, uuid }: FlowLayoutProps) => (
  <>
    <LegacyPaymentSchedule>
      <Title section="paymentSchedule" />
    </LegacyPaymentSchedule>
    <LegacyPaymentProviders>
      <Title section="paymentProviders" />
    </LegacyPaymentProviders>
    <LegacyCardInstallments>
      <Title section="cardInstallments" />
    </LegacyCardInstallments>
    <LegacyContactChoice reference={reference} uuid={uuid}>
      <Title section="contactChoice" />
    </LegacyContactChoice>
    <FormSlot target={slots?.donation}>
      <LegacyDonation>
        <Title section="donation" />
      </LegacyDonation>
    </FormSlot>
    <LegacyComments>
      <Title section="comments" />
    </LegacyComments>
    <LegacyCgv>
      <Title section="cgv" />
    </LegacyCgv>
    <LegacyBillingAddress>
      <Title section="billingAddress" />
    </LegacyBillingAddress>
    <LegacyPaymentWidget>
      <Title section="paymentWidget" />
    </LegacyPaymentWidget>
    <SubmitSlot target={slots?.submit}>
      <LegacySubmitButton className={slots?.submit ? 'w-full' : 'my-8 self-center'}>
        <SubmitLabel />
      </LegacySubmitButton>
    </SubmitSlot>
  </>
);
