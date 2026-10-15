import { BillingAddress } from '../BillingAddress';
import { CardInstallments } from '../CardInstallments';
import { Cgv } from '../Cgv';
import { Comments } from '../Comments';
import { ContactChoice } from '../ContactChoice';
import { Donation } from '../Donation';
import { PaymentProviders } from '../PaymentProviders';
import { PaymentSchedule } from '../PaymentSchedule';
import { PaymentWidget } from '../PaymentWidget';
import { SubmitButton } from '../SubmitButton';
import { FormSlot, SubmitSlot } from './FormSlots';
import { type FlowLayoutProps, SubmitLabel, Title } from './flowShared';

export const CurrentFlow = ({ slots, reference, uuid }: FlowLayoutProps) => (
  <>
    <PaymentSchedule>
      <Title section="paymentSchedule" />
    </PaymentSchedule>
    <PaymentProviders>
      <Title section="paymentProviders" />
    </PaymentProviders>
    <CardInstallments>
      <Title section="cardInstallments" />
    </CardInstallments>
    <ContactChoice reference={reference} uuid={uuid}>
      <Title section="contactChoice" />
    </ContactChoice>
    <FormSlot target={slots?.donation}>
      <Donation>
        <Title section="donation" />
      </Donation>
    </FormSlot>
    <Comments>
      <Title section="comments" />
    </Comments>
    <Cgv>
      <Title section="cgv" />
    </Cgv>
    <BillingAddress>
      <Title section="billingAddress" />
    </BillingAddress>
    <PaymentWidget>
      <Title section="paymentWidget" />
    </PaymentWidget>
    <SubmitSlot target={slots?.submit}>
      <SubmitButton className={slots?.submit ? 'w-full' : 'my-8 self-center'}>
        <SubmitLabel />
      </SubmitButton>
    </SubmitSlot>
  </>
);
