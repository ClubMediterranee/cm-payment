import type {
  ClubMedApiSettings,
  OidcSettings,
  SDKOptions,
} from '@clubmed/payment-sdk/types/SDKOptions';
import type { PropsWithChildren } from 'react';
import { createContext } from 'react';

import { Action } from '../__generated__';

export type SDKConfigProviderProps = PropsWithChildren<
  Omit<SDKOptions, 'action'> & { action?: Action }
>;

export const SDKConfigContext = createContext<SDKOptions>({
  action: '' as unknown as Action,
  url: '',
  proposalId: '',
  bookingId: '',
  customerId: '',
  locale: navigator.language || 'en-US',
  oidc: undefined as unknown as OidcSettings,
  api: undefined as unknown as ClubMedApiSettings,
  callbackUrl: '',
});

const ref: { value: SDKOptions } = {
  value: {} as SDKOptions,
};

export function getSDKPaymentOptions() {
  return ref.value;
}

export const SDKConfigProvider = ({ children, ...props }: SDKConfigProviderProps) => {
  let action = props.action;

  // TO DO: remove this and replace with action from booking or proposal status
  if (!action) {
    action = props.bookingId ? Action.PAYMENT_SOLDE : Action.PAYMENT_RESA;
  }

  ref.value = {
    ...props,
    action,
  };

  return <SDKConfigContext.Provider value={ref.value}>{children}</SDKConfigContext.Provider>;
};
