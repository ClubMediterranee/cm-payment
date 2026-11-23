import { PaymentPanel } from '../PaymentPanel';
import { PaymentSchedule } from '../PaymentSchedule';
import type { FlowLayoutProps } from './flowShared';

export const CurrentFlow = ({ slots, reference, uuid }: FlowLayoutProps) => (
  <div className="flex flex-col gap-40">
    <PaymentSchedule />
    <PaymentPanel reference={reference} uuid={uuid} slots={slots} />
  </div>
);
