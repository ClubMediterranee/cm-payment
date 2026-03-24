import type { Content } from './Content.js';
import type { PaymentConfig } from './PaymentConfig.js';

export type CapsFormConfig = {
  content: Content;
  isSeller: boolean;
  maxAmount: number;
  providersConfig: PaymentConfig['providers'];
};
