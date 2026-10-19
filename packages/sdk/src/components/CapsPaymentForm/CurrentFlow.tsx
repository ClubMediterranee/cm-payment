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
import { type FlowLayoutProps, Title } from './flowShared';
import { PayLabel } from './PayLabel';
import { Step } from './Step';

export const CurrentFlow = ({ slots, reference, uuid }: FlowLayoutProps) => (
  <>
    <PaymentSchedule>
      <Title section="paymentSchedule" variant="section" />
    </PaymentSchedule>
    <Step name="providers">
      <PaymentProviders>
        <Title section="paymentProviders" variant="section" />
        <PaymentProviders.Panel>
          <CardInstallments>
            <Title section="cardInstallments" variant="label" />
          </CardInstallments>
          <BillingAddress>
            <Title section="billingAddress" variant="label" />
          </BillingAddress>
          <PaymentWidget />
          <ContactChoice reference={reference} uuid={uuid}>
            <Title section="contactChoice" variant="label" />
          </ContactChoice>
          <Comments>
            <Title section="comments" variant="label" />
          </Comments>
          <Cgv className="group-data-cgv-first/panel:-order-1">
            <Title section="cgv" variant="label" />
          </Cgv>
          <Step name="submit">
            <SubmitSlot target={slots?.submit}>
              <SubmitButton color="saffron" className={slots?.submit ? 'w-full' : 'self-center'}>
                <PayLabel />
              </SubmitButton>
            </SubmitSlot>
          </Step>
        </PaymentProviders.Panel>
      </PaymentProviders>
    </Step>
    <Step name="details">
      <FormSlot target={slots?.donation}>
        <Donation />
      </FormSlot>
    </Step>
  </>
);
