import {hasAuthParams, useAuth} from "react-oidc-context";
import "./App.css";
// import {Header} from "./components/Header";
// import {PaymentPage} from "./pages/PaymentPage";
import {Route, Switch, useRoute} from "wouter";
import {useEffect, useState} from "react";
import {AppProvider} from "./providers/AppProvider.js";
import {SigninRedirectPage} from "./pages/SigninRedirectPage.js";
import {Header} from "./components/Header.js";
import {PaymentPage} from "./pages/PaymentPage.js";
// import {AppProvider} from "./providers/AppProvider";
// import {RedirectPage} from "./pages/RedirectPage";


export const Router = () => {
  const [isAuthRequired] = useRoute("/*/booking/*");
  const auth = useAuth();
  // const search = useSearch();
  // const customerId = new URLSearchParams(search).get("customer_id") || "";
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
        state: {return_url: window.location.href},
      });
      setHasInitSignin(true);
    }
  }, [isAuthRequired, auth, hasInitSignin]);

  return (
    <AppProvider>
      <Header/>
      <main className="flex flex-col gap-8 row-start-2">
        <Switch>
          <Route path={"/:issuer/:type/:id"}>
            <PaymentPage/>
          </Route>

          <Route path={"/:issuer/redirect/:paymentId/:locale?"}>
            {/*<RedirectPage/>*/}
          </Route>

          <Route path={"/confirmation"}>
            <div>confirmation</div>
          </Route>


          <Route path={"/:issuer/signin_redirect"}>
            <SigninRedirectPage/>
          </Route>

          <Route>
            <div className="min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
              {/*<Header/>*/}
              <div className="flex justify-center font-semibold">404 not found</div>
            </div>
          </Route>
        </Switch>
      </main>
    </AppProvider>
  );
};
