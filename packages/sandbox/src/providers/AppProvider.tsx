import {createContext, PropsWithChildren,} from "react";
import {SDKConfigProvider} from "@clubmed/payment-sdk/providers/SDKConfigProvider.js";
import {useAppParams} from "../hooks/useAppParams.js";
import {LoadingPage} from "../pages/LoadingPage.js";

type AppContextType = {
  isIframe: boolean;
};

export const AppContext = createContext<AppContextType>({
  isIframe: false
});

export const AppProvider = ({children}: PropsWithChildren) => {
  const {isIframe, url, values, api, oidc, callbackUrl} = useAppParams();

  if (!values) {
    return <LoadingPage/>;
  }

  return (
    <AppContext.Provider
      value={{
        isIframe
      }}
    >
      <SDKConfigProvider
        url={url}
        locale={values.locale}
        proposalId={values.proposalId}
        bookingId={values.bookingId}
        customerId={values.customerId}
        api={api}
        oidc={oidc}
        callbackUrl={callbackUrl}
      >
        {children}
      </SDKConfigProvider>
    </AppContext.Provider>
  );
};
