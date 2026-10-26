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

export const CurrentFlow = ({ content, slots, reference, uuid }: FlowLayoutProps) => (
  <>
    <PaymentSchedule>
      <Title variant="section">{content.paymentSchedule.heading}</Title>
    </PaymentSchedule>
    <Step after="amount">
      <PaymentProviders>
        <Title variant="section">{content.paymentProviders.heading}</Title>
        <PaymentProviders.Panel>
          <CardInstallments />
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
              <SubmitButton color="saffron" className={slots?.submit ? 'w-full' : 'self-center'}>
                <PayLabel />
              </SubmitButton>
            </SubmitSlot>
          </Step>
        </PaymentProviders.Panel>
      </PaymentProviders>
    </Step>
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
