import { CardForm } from '../components/CardForm';
import { Cgv } from '../components/Cgv';
import { ContactChoice } from '../components/ContactChoice';
import { IframeProvider } from '../components/IframeProvider';
import { PaymentProviders } from '../components/PaymentProviders';
import { PaymentSchedule } from '../components/PaymentSchedule';
import { TOKENS } from './Tokens';

export const SKELETON_REGISTRY = {
  [TOKENS.PaymentSchedule]: PaymentSchedule.Skeleton,
  [TOKENS.PaymentProviders]: PaymentProviders.Skeleton,
  [TOKENS.ContactChoice]: ContactChoice.Skeleton,
  [TOKENS.Cgv]: Cgv.Skeleton,
  [TOKENS.CardForm]: CardForm.Skeleton,
  [TOKENS.IframeProvider]: IframeProvider.Skeleton,
} as const;
