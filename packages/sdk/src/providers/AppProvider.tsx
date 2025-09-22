import {
  createContext,
  PropsWithChildren,
} from "react";
import { Action, BookingStatus } from "../__generated__";

type AppContextType = {
  id: string;
  issuer: string;
  type: string;
  customerId: string;
  action: Action;
  callbackUrl: string;
  onLoad?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: Error) => void;
};  

export const AppContext = createContext<AppContextType>({
  id: "",
  type: "",
  issuer:"gm",
  customerId: "",
  action: Action.PAYMENT_RESA as Action,
  callbackUrl: "",
  onLoad: () => {},
  onLoadEnd: () => {},
  onError: () => {},
});

const getAction = (status?: BookingStatus) => {
  switch (status) {
    case BookingStatus.OPTION:
      return Action.PAYMENT_OPTION;
    case BookingStatus.VALIDATED:
      return Action.PAYMENT_SOLDE;
    default:
      return Action.PAYMENT_RESA;
  }
};

export type AppProviderProps = PropsWithChildren<Omit<AppContextType, "action"> & { status?: BookingStatus }>


export const AppProvider = ({ children, id, type, status, issuer, customerId, callbackUrl, onLoad, onLoadEnd, onError }: AppProviderProps) => {
  const action = getAction(status);

  return (
    <AppContext.Provider
      value={{ id, type, issuer, customerId, action, callbackUrl, onLoad, onLoadEnd, onError }}
    >
      {children}
    </AppContext.Provider>
  );
};
