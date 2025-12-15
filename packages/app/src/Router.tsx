import './App.css';

import { Route, Switch, useRoute } from 'wouter';

import { Header } from './components/Header';
import { useAutoSignin } from './hooks/useAutoSignin';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { PaymentPage } from './pages/PaymentPage';
import { RedirectPage } from './pages/RedirectPage';
import { SigninRedirectPage } from './pages/SigninRedirectPage';
import { AppProvider } from './providers/AppProvider';

const NotFound = () => (
  <div className="min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
    <div className="flex justify-center font-semibold">404 not found</div>
  </div>
);

const Footer = () => <footer className="bg-lightSand mt-48 h-100" />;

export const Router = () => {
  const [isRedirectRoute] = useRoute('/*/redirect/*');
  const { isSigningIn } = useAutoSignin();

  if (isSigningIn) return null;

  return (
    <AppProvider>
      {!isRedirectRoute && <Header />}
      <main className="flex flex-col gap-8 row-start-2 relative">
        <Switch>
          <Route path="/:issuer/redirect/:paymentId/:locale?">
            <RedirectPage />
          </Route>

          <Route path="/:issuer/confirmation">
            <ConfirmationPage />
          </Route>

          <Route path="/:issuer/signin_redirect">
            <SigninRedirectPage />
          </Route>

          <Route path="/:issuer/:type/:id">
            <PaymentPage />
          </Route>

          <Route>
            <NotFound />
          </Route>
        </Switch>
      </main>
      {!isRedirectRoute && <Footer />}
    </AppProvider>
  );
};
