---
sidebar_position: 4
---

# Exemple complet

Intégration du mode redirection dans une application React (SPA).

## Étape 1 : Créer la page de paiement

Sur votre page de réservation/proposition, ajoutez un bouton qui redirige vers l'URL de paiement Club Med.

```tsx
// pages/BookingPage.tsx
export default function BookingPage() {
  const handlePayment = () => {
    // Construire l'URL de paiement
    const paymentUrl =
      `https://payment.clubmed.com/gm/booking/1234567` +
      `?action=PAYMENT_SOLDE` +
      `&customer_id=7654321` +
      `&callback_url=${encodeURIComponent(`${window.location.origin}/confirmation`)}`;

    // Rediriger l'utilisateur
    window.location.href = paymentUrl;
  };

  return (
    <div>
      <h1>Réservation #1234567</h1>
      <p>Montant : 1500.00 EUR</p>
      <button onClick={handlePayment}>Payer maintenant</button>
    </div>
  );
}
```

**Ce qui se passe :**

1. L'utilisateur clique sur "Payer maintenant"
2. Il est redirigé vers `payment.clubmed.com`
3. Il effectue son paiement
4. Il est renvoyé vers votre `callback_url` avec les paramètres de résultat

## Étape 2 : Créer la page de confirmation

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
          <button onClick={() => (window.location.href = `/booking/${bookingId}`)}>
            Réessayer
          </button>
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
          <button onClick={() => (window.location.href = `/booking/${bookingId}`)}>
            Retour à la réservation
          </button>
        </>
      )}
    </div>
  );
}
```

## Étape 3 : Configurer le router

Ajoutez la route `/confirmation` à votre router.

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BookingPage from './pages/BookingPage';
import ConfirmationPage from './pages/ConfirmationPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/booking/:id" element={<BookingPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## C'est tout !

Votre intégration est complète. Le flux est maintenant :

1. **Utilisateur sur `/booking/1234567`** → Clique sur "Payer"
2. **Redirigé vers `payment.clubmed.com`** → Effectue le paiement
3. **Revient sur `/confirmation?payment_status=OK&...`** → Voit le résultat

## Prochaines étapes

- **[Mode Intégré](../integrated/installation)** - Pour garder l'utilisateur dans votre app
- **[Configuration](./configuration)** - Configuration du mode redirection
