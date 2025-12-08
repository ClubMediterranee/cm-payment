import { CardForm } from '../components/CardForm';
import { Cgv } from '../components/Cgv';
import { ContactChoice } from '../components/ContactChoice';
import { PaymentProviders } from '../components/PaymentProviders';
import { PaymentSchedule } from '../components/PaymentSchedule';
import { TOKENS } from './Tokens';

export const SKELETON_REGISTRY = {
  [TOKENS.PaymentSchedule]: PaymentSchedule.Skeleton,
  [TOKENS.PaymentProviders]: PaymentProviders.Skeleton,
  [TOKENS.ContactChoice]: ContactChoice.Skeleton,
  [TOKENS.Cgv]: Cgv.Skeleton,
  [TOKENS.CardForm]: CardForm.Skeleton,
} as const;
