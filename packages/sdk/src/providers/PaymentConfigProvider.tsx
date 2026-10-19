import type { PropsWithChildren } from 'react';

import { contentByTheme, DEFAULT_CAPS_THEME } from '../content/themes';
import { CapsConfigContext } from '../contexts/CapsConfigContext';
import type { CapsTheme } from '../embed/shared';
import { CapsSettings } from '../types/CapsSettings';
import type { DeepPartial } from '../types/Content';
import { mergeFromPattern } from '../utils/mergeFromPattern';
import { QueryClientProvider } from './QueryClientProvider';

export type PaymentConfigProviderProps = PropsWithChildren<
  Omit<CapsSettings, 'content' | 'id' | 'type' | 'country' | 'language'> & {
    content?: DeepPartial<CapsSettings['content']>;
    theme?: CapsTheme;
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
  theme = DEFAULT_CAPS_THEME,
  ...props
}: PaymentConfigProviderProps) => {
  const activeContent = mergeFromPattern(contentByTheme[theme], props.content);

  const [country, language] = props.locale.split('-');

  ref.value = {
    ...props,
    country,
    language,
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
