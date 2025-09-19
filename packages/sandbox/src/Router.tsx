import { hasAuthParams, useAuth } from "react-oidc-context";
import "./App.css";
import { Header } from "./components/Header";
import { PaymentPage } from "./pages/PaymentPage";
import { Route, Switch, useRoute, useSearch } from "wouter";
import { lazy, Suspense, useEffect, useState } from "react";
import { AppProvider } from "./providers/AppProvider";
import { RedirectPage } from "./pages/RedirectPage";
import { paymentSDK } from "@cm-payment/sdk/src";
import { getAccessToken, getApiKey } from "./utils/fetcher";

const Loader = lazy(async () => ({
  default: (await import("@clubmed/trident-ui/molecules/Loader")).Loader,
}));

export const Router = () => {
  const [isAuthRequired] = useRoute("/*/booking/*");
  const auth = useAuth();
  const search = useSearch();
  const neolaneId = new URLSearchParams(search).get("neolane_id") || "";
  const [hasInitSignin, setHasInitSignin] = useState(false);

  paymentSDK.setFetchOptions({ apiKey: getApiKey(), getAccessToken: getAccessToken });

  useEffect(() => {
    if (
      isAuthRequired &&
      !hasAuthParams() &&
      !auth.isAuthenticated &&
      !auth.activeNavigator &&
      !auth.isLoading &&
      !hasInitSignin
    ) {

      auth.signinRedirect({
        state: { return_url: window.location.href, neolane_id: neolaneId },
      });
      setHasInitSignin(true);
    }
  }, [isAuthRequired, auth, hasInitSignin, neolaneId]);

  return (
    <Switch>
      <Route path={"/:issuer/redirect/:paymentId/:locale?"}>
        <RedirectPage />
      </Route>
      <Route path={"/:issuer/:type/:id/:locale?"}>
        <AppProvider>
        <Header />
          <main className="flex flex-col gap-8 row-start-2">
            <PaymentPage />
          </main>
        </AppProvider>
      </Route>
      <Route path={"/confirmation"}>
        <div>confirmation</div>        
      </Route>
      <Route path={"/signin_redirect"}>
        <Suspense fallback={null}>
          <Loader
            isVisible
            label="This is like elevator music but for your eyes. Please wait while we load your content."
          />
        </Suspense>
      </Route>
      <Route>
        <div className="min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
          <Header />  
          <div className="flex justify-center font-semibold">404 not found</div>
        </div>
      </Route>
    </Switch>
  );
};
