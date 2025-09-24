import {PropsWithChildren,} from "react";
import {Action, BookingStatus} from "../__generated__";
import {SDKConfigContext} from "@clubmed/payment-sdk/contexts/SDKConfigContext.js";
import type {SDKOptions} from "@clubmed/payment-sdk/types/SDKOptions.js";

const ACTIONS = {
  [BookingStatus.OPTION]: Action.PAYMENT_OPTION,
  [BookingStatus.VALIDATED]: Action.PAYMENT_SOLDE,
  DEFAULT: Action.PAYMENT_RESA,
} as const;

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
