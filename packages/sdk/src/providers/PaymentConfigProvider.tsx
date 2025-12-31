import type { CapsSettings } from '@clubmed/payment-sdk/types/CapsSettings';
import type { PropsWithChildren } from 'react';

import { defaultContent } from '../content/default';
import { CapsConfigContext } from '../contexts/CapsConfigContext';
import { mergeFromPattern } from '../utils/mergeFromPattern';
import { QueryClientProvider } from './QueryClientProvider';

export type PaymentConfigProviderProps = PropsWithChildren<
  Omit<CapsSettings, 'content' | 'id' | 'type'> & {
    content?: Partial<CapsSettings['content']>;
    bookingId?: string;
    proposalId?: string;
  }
>;

const ref: { value: CapsSettings } = {
  value: {} as CapsSettings,
};

export function getPaymentConfig() {
  return ref.value;
}

export const PaymentConfigProvider = ({
  children,
  bookingId,
  proposalId,
  ...props
}: PaymentConfigProviderProps) => {
  const activeContent = mergeFromPattern(defaultContent, props.content);

  ref.value = {
    ...props,
    content: activeContent,
    id: bookingId || proposalId!,
    type: bookingId ? 'booking' : 'proposal',
  };

  return (
    <QueryClientProvider>
      <CapsConfigContext.Provider value={ref.value}>{children}</CapsConfigContext.Provider>
    </QueryClientProvider>
  );
};
