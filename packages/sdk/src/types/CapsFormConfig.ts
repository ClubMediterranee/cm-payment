import type { Content } from './Content';
import type { PaymentConfig } from './PaymentConfig';

export type CapsFormConfig = {
  content: Content;
  isSeller: boolean;
  maxAmount: number;
  providersConfig: PaymentConfig['providers'];
};
