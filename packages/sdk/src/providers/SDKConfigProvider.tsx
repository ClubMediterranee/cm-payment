import type {PropsWithChildren} from "react";
import {Action, BookingStatus} from "../__generated__";
import {createContext} from "react";
import type {ClubMedApiSettings, OidcSettings, SDKOptions} from "@clubmed/payment-sdk/types/SDKOptions";

const ACTIONS = {
  [BookingStatus.OPTION]: Action.PAYMENT_OPTION,
  [BookingStatus.VALIDATED]: Action.PAYMENT_SOLDE,
  DEFAULT: Action.PAYMENT_RESA,
} as const;

export const SDKConfigContext = createContext<SDKOptions>({
  action: Action.PAYMENT_RESA as Action,
  url: "",
  proposalId: "",
  bookingId: "",
  customerId: "",
  locale: navigator.language || "en-US",
  oidc: undefined as unknown as OidcSettings,
  api: undefined as unknown as ClubMedApiSettings,
  callbackUrl: ""
});

const getAction = (status?: BookingStatus) => {
  return ACTIONS[status as keyof typeof ACTIONS] || ACTIONS.DEFAULT;
};

export type SDKPaymentProviderProps = PropsWithChildren<Omit<SDKOptions, "action"> & { status?: BookingStatus }>

const ref: {value: SDKOptions}  = {
  value: {} as SDKOptions
}

export function getSDKPaymentOptions() {
  return ref.value;
}

export const SDKConfigProvider = ({
                                     children,
                                     ...props
                                   }: SDKPaymentProviderProps) => {
  const action = getAction(props.status);

  ref.value = {
    ...props,
    action
  }

  return (
    <SDKConfigContext.Provider
      value={ref.value}
    >
      {children}
    </SDKConfigContext.Provider>
  );
};
