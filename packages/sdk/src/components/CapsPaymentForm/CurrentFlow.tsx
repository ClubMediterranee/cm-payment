import { PaymentPanel } from '../PaymentPanel';
import { PaymentSchedule } from '../PaymentSchedule';
import type { FlowLayoutProps } from './flowShared';

export const CurrentFlow = ({ slots, reference, uuid }: FlowLayoutProps) => (
  <>
    <PaymentSchedule />
    <PaymentPanel reference={reference} uuid={uuid} slots={slots} />
  </>
);
