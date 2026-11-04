import { Cgv } from '../components/Cgv';
import { ContactChoice } from '../components/ContactChoice';
import { PaymentPanel } from '../components/PaymentPanel';
import { PaymentSchedule } from '../components/PaymentSchedule';
import { PaymentWidget } from '../components/PaymentWidget';
import { TOKENS } from './Tokens';

export const SKELETON_REGISTRY = {
  [TOKENS.PaymentSchedule]: PaymentSchedule.Skeleton,
  [TOKENS.PaymentProviders]: PaymentPanel.Skeleton,
  [TOKENS.PaymentPanel]: PaymentPanel.Skeleton,
  [TOKENS.ContactChoice]: ContactChoice.Skeleton,
  [TOKENS.Cgv]: Cgv.Skeleton,
  [TOKENS.PaymentWidget]: PaymentWidget.Skeleton,
} as const;
