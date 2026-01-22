---
sidebar_position: 1
---

# Installation

## Prérequis

- **React** 18 ou supérieur
- **TypeScript** 4.9 ou supérieur (recommandé)
- **Node.js** 18 ou supérieur

## Installation du package

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="pnpm" label="pnpm" default>
    ```bash
    pnpm add @clubmed/caps react react-dom @tanstack/react-query
    ```
  </TabItem>
  <TabItem value="npm" label="npm">
    ```bash
    npm install @clubmed/caps react react-dom @tanstack/react-query
    ```
  </TabItem>
  <TabItem value="yarn" label="yarn">
    ```bash
    yarn add @clubmed/caps react react-dom @tanstack/react-query
    ```
  </TabItem>
</Tabs>

## Configuration initiale

### 1. Import des styles

Importez les styles CSS du SDK dans votre point d'entrée :

```tsx
import '@clubmed/caps/style.css';
```

### 2. Configuration du PaymentConfigProvider

Le SDK nécessite le `PaymentConfigProvider` pour fonctionner. Wrap votre application avec ce provider :

```tsx
import { PaymentConfigProvider } from '@clubmed/caps';

function App() {
  return (
    <PaymentConfigProvider
      paymentGatewayUrl="https://cm-payment-staging-ca98dc5783da.herokuapp.com"
      locale="fr-FR"
      proposalId="123456"
      customerId="789"
      api={{
        url: 'https://api.clubmed.com',
        apiKey: 'YOUR_API_KEY',
      }}
      oidc={{
        issuerType: 'GM', // 'GM' | 'GO' | 'PARTNERS'
        accessToken: 'YOUR_ACCESS_TOKEN',
      }}
      callbackUrl="https://monapp.com/confirmation"
    >
      {/* Votre application */}
    </PaymentConfigProvider>
  );
}
```

#### Props de PaymentConfigProvider

| Prop                | Type                         | Requis | Description                                          |
| ------------------- | ---------------------------- | ------ | ---------------------------------------------------- |
| `paymentGatewayUrl` | `string`                     | ✅     | URL de l'application de paiement Club Med            |
| `locale`            | `string`                     | ✅     | Locale (ex: `fr-FR`, `en-US`)                        |
| `proposalId`        | `string`                     | ⚠️     | ID de la proposition (requis si pas de `bookingId`)  |
| `bookingId`         | `string`                     | ⚠️     | ID de la réservation (requis si pas de `proposalId`) |
| `customerId`        | `string`                     | ✅     | ID du client                                         |
| `api.url`           | `string`                     | ✅     | URL de l'API Club Med                                |
| `api.apiKey`        | `string`                     | ✅     | Clé API Club Med                                     |
| `oidc.issuerType`   | `'GM' \| 'GO' \| 'PARTNERS'` | ✅     | Type d'émetteur                                      |
| `oidc.accessToken`  | `string`                     | ✅     | Token d'accès OIDC                                   |
| `callbackUrl`       | `string`                     | ✅     | URL de retour après paiement                         |
| `callbackUrlSeller` | `string`                     | ❌     | URL de retour pour les vendeurs (optionnel)          |
| `cmsUrl`            | `string`                     | ❌     | URL du CMS (optionnel)                               |

:::info URLs de l'application de paiement
Le `paymentGatewayUrl` doit pointer vers l'une des URLs suivantes selon l'environnement :

- **Staging** : `https://cm-payment-staging-ca98dc5783da.herokuapp.com`
- **Intégration** : `https://cm-payment-integ.clubmed.com`
- **Production** : `https://cm-payment.clubmed.com`

Les providers de paiement (EIXOPAY, PayPal, etc.) redirigent vers `{paymentGatewayUrl}/{issuer}/redirect/{paymentId}`.
:::

## Prochaines étapes

**[→ Formulaire de paiement](./form-setup)** - Configuration des composants de paiement
