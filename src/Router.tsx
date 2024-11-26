import { hasAuthParams, useAuth } from "react-oidc-context";
import "./App.css";
import { Header } from "./components/Header";
import { PaymentPage } from "./pages/PaymentPage";
import { Route, Switch, useRoute, useSearch } from "wouter";
import { useEffect, useState } from "react";
import { AppProvider } from "./providers/AppProvider";
import { Loader } from "@clubmed/trident-ui/molecules/Loader";
import { RedirectPage } from "./pages/RedirectPage";
import Cookies from "js-cookie";

export const Router = ({ withLayout = true }) => {
  const [isAuthRequired] = useRoute("/booking/*");
  const auth = useAuth();
  const search = useSearch();
  const issuer = new URLSearchParams(search).get("issuer") || "gm";
  const neolaneId = new URLSearchParams(search).get("neolane_id") || "";
  const [hasInitSignin, setHasInitSignin] = useState(false);

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
  }, [isAuthRequired, auth, hasInitSignin]);

  if (!Cookies.get("issuer")) {
    Cookies.set("issuer", issuer, { sameSite: "none", secure: true });
  }

  return (
    <Switch>
      <Route path={"/redirect/:paymentId"}>
        <RedirectPage />
      </Route>
      <Route path={"/:type/:id/:locale?"}>
        <AppProvider>
          <div className="min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
            {withLayout && <Header />}
            <main className="flex flex-col gap-8 row-start-2">
              {<PaymentPage />}
            </main>
          </div>
        </AppProvider>
      </Route>
      <Route path={"/signin_redirect"}>
        <Loader
          isVisible
          label="This is like elevator music but for your eyes. Please wait while we load your content."
        />
      </Route>
      <Route>
        <div className="min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
          {withLayout && <Header />}
          <div className="flex justify-center font-semibold">404 not found</div>
        </div>
      </Route>
    </Switch>
  );
};
