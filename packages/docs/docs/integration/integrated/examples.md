---
sidebar_position: 3
---

# Exemple complet

Intégration du mode intégré dans une application React (SPA).

## Étape 1 : Configuration du Provider

Wrappez votre application avec le `PaymentConfigProvider` pour configurer le SDK.

```tsx
// App.tsx
import { PaymentConfigProvider } from '@clubmed/caps';
import '@clubmed/caps/style.css';

function App() {
  return (
    <PaymentConfigProvider
      paymentGatewayUrl="https://cm-payment-staging-ca98dc5783da.herokuapp.com" // ou cm-payment-integ.clubmed.com ou cm-payment.clubmed.com
      locale="fr-FR"
      bookingId="123456"
      customerId="789"
      api={{
        url: 'https://api.clubmed.com',
        apiKey: 'YOUR_API_KEY',
      }}
      oidc={{
        issuerType: 'GM',
        accessToken: 'YOUR_ACCESS_TOKEN',
      }}
      callbackUrl="/confirmation"
    >
      {/* Votre application */}
    </PaymentConfigProvider>
  );
}
```

**Ce qui se passe :**

1. Le SDK se configure avec vos paramètres (booking, customer, API)
2. Tous les composants enfants ont accès à cette configuration
3. Le `paymentGatewayUrl` pointe vers l'application de paiement Club Med

## Étape 2 : Créer la page de paiement

Créez une page avec le formulaire de paiement et les composants requis selon votre canal.

```tsx
// pages/PaymentPage.tsx
import { Form, PaymentSchedule, PaymentProviders, Cgv, CardForm } from '@clubmed/caps';

export default function PaymentPage() {
  const handleError = (error: Error) => {
    console.error('Erreur de paiement:', error);
  };

  const handleLoad = () => {
    console.log('Soumission en cours...');
  };

  const handleLoadEnd = () => {
    console.log('Soumission terminée');
  };

  return (
    <div className="payment-page">
      <h1>Finaliser votre paiement</h1>

      <Form
        action="PAYMENT_SOLDE"
        onError={handleError}
        onLoad={handleLoad}
        onLoadEnd={handleLoadEnd}
      >
        {/* Composants requis pour GM */}
        <PaymentSchedule />
        <PaymentProviders />
        <Cgv />
        <CardForm />

        <button type="submit">Payer</button>
      </Form>
    </div>
  );
}
```

**Ce qui se passe :**

1. Le `<Form>` gère la soumission du paiement
2. Les composants affichent les options de paiement (échéancier, moyens de paiement, CGV)
3. À la soumission, le SDK redirige vers le provider de paiement (3D Secure, etc.)
4. Le provider redirige ensuite vers votre `callbackUrl` avec le résultat

## Étape 3 : Créer la page de confirmation

Créez la page `/confirmation` qui affiche le résultat du paiement.

```tsx
// pages/ConfirmationPage.tsx
import { useSearchParams } from 'react-router-dom';

export default function ConfirmationPage() {
  const [searchParams] = useSearchParams();

  const status = searchParams.get('payment_status');
  const bookingId = searchParams.get('booking_id');
  const paymentId = searchParams.get('payment_id');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');

  return (
    <div>
      {status === 'OK' && (
        <>
          <h1>✅ Paiement confirmé !</h1>
          <p>
            Montant : {amount} {currency}
          </p>
          <p>Référence : {paymentId}</p>
          <p>Réservation : {bookingId}</p>
        </>
      )}

      {(status === 'REFUSED_PSP' || status === 'REFUSED_CM') && (
        <>
          <h1>❌ Paiement échoué</h1>
          <p>Une erreur est survenue lors du paiement.</p>
          <button onClick={() => window.history.back()}>Réessayer</button>
        </>
      )}

      {status === 'PENDING' && (
        <>
          <h1>⏳ Paiement en cours</h1>
          <p>Votre paiement est en cours de vérification.</p>
        </>
      )}

      {(status === 'CANCELED' || status === 'CANCELLED') && (
        <>
          <h1>Paiement annulé</h1>
          <p>Vous avez annulé le paiement.</p>
          <button onClick={() => window.history.back()}>Retour</button>
        </>
      )}
    </div>
  );
}
```

## Étape 4 : Configurer le router

Ajoutez les routes nécessaires à votre router.

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PaymentConfigProvider } from '@clubmed/caps';
import PaymentPage from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage';

export default function App() {
  return (
    <PaymentConfigProvider
      paymentGatewayUrl="https://cm-payment-staging-ca98dc5783da.herokuapp.com" // ou cm-payment-integ.clubmed.com ou cm-payment.clubmed.com
      locale="fr-FR"
      bookingId="123456"
      customerId="789"
      api={{
        url: 'https://api.clubmed.com',
        apiKey: 'YOUR_API_KEY',
      }}
      oidc={{
        issuerType: 'GM',
        accessToken: 'YOUR_ACCESS_TOKEN',
      }}
      callbackUrl="/confirmation"
    >
      <BrowserRouter>
        <Routes>
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
        </Routes>
      </BrowserRouter>
    </PaymentConfigProvider>
  );
}
```

## C'est tout !

Votre intégration est complète. Le flux est maintenant :

1. **Utilisateur sur `/payment`** → Remplit le formulaire et soumet
2. **Redirigé vers le provider de paiement** → Effectue le paiement (3D Secure, etc.)
3. **Redirigé vers `/confirmation?payment_status=OK&...`** → Voit le résultat
