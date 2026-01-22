---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Configuration

## Concepts

### Booking vs Proposal

<Tabs>
<TabItem value="booking" label="Booking" default>

**Réservation confirmée**

Un booking représente une réservation déjà validée pour laquelle on effectue un paiement (solde, options, surclassement, etc.).

</TabItem>
<TabItem value="proposal" label="Proposal">

**Proposition de réservation**

Une proposal est un devis en attente de conversion. Le paiement transforme automatiquement la proposition en réservation confirmée.

</TabItem>
</Tabs>

### Structure de l'URL de paiement

L'URL de redirection suit ce format :

```
https://payment.clubmed.com/{issuer}/{type}/{entityId}
```

**Paramètres de chemin :**

- `issuer` : Canal de distribution (`gm`, `go`, `partners`)
- `type` : Type d'entité (`booking` ou `proposal`)
- `entityId` : Identifiant de l'entité (bookingId ou proposalId)

**Paramètres additionnels :**

Les paramètres de configuration sont passés en **query string** (après `?`).

:::info Canal de distribution
Le paramètre `issuer` dans l'URL correspond au **canal de distribution**
:::

### Actions possibles

Les actions définissent le type de paiement à effectuer :

| Action                 | Description               | Disponible pour |
| ---------------------- | ------------------------- | --------------- |
| `PAYMENT_SOLDE`        | Paiement du solde         | Booking         |
| `PAYMENT_CART`         | Paiement du panier        | Booking         |
| `PAYMENT_OPTION`       | Paiement d'options        | Booking         |
| `PAYMENT_PARTIAL`      | Paiement partiel          | Booking         |
| `PAYMENT_UPGRADE_ROOM` | Paiement de surclassement | Booking         |
| `PAYMENT_RESA`         | Paiement de réservation   | Proposal (auto) |

## Exemples d'implémentation

<Tabs>
<TabItem value="booking" label="Booking" default>

### Paramètres

| Paramètre             | Requis               | Description        | Défaut          |
| --------------------- | -------------------- | ------------------ | --------------- |
| `customer_id`         | ✅ Oui               | ID client          | -               |
| `callback_url`        | ✅ Oui               | URL de retour      | -               |
| `callback_url_seller` | ⚠️ Oui (GO/PARTNERS) | URL retour GO      | -               |
| `action`              | ❌ Non               | Action de paiement | `PAYMENT_SOLDE` |
| `back_url`            | ❌ Non               | URL bouton retour  | `referrer`      |

### Exemple de code

```javascript
const issuer = 'gm';
const type = 'booking';
const bookingId = '1234567';
const customerId = '7654321';
const action = 'PAYMENT_SOLDE'; // Optionnel, PAYMENT_SOLDE par défaut
const callbackUrl = 'https://monapp.com/confirmation';

const paymentUrl =
  `https://payment.clubmed.com/${issuer}/${type}/${bookingId}` +
  `?action=${action}` +
  `&customer_id=${customerId}` +
  `&callback_url=${encodeURIComponent(callbackUrl)}`;

window.location.href = paymentUrl;
```

### URL générée

```
https://payment.clubmed.com/gm/booking/1234567?action=PAYMENT_SOLDE&customer_id=7654321&callback_url=https%3A%2F%2Fmonapp.com%2Fconfirmation
```

</TabItem>
<TabItem value="proposal" label="Proposal">

### Paramètres

| Paramètre             | Requis               | Description       | Défaut     |
| --------------------- | -------------------- | ----------------- | ---------- |
| `callback_url`        | ✅ Oui               | URL de retour     | -          |
| `callback_url_seller` | ⚠️ Oui (GO/PARTNERS) | URL retour GO     | -          |
| `back_url`            | ❌ Non               | URL bouton retour | `referrer` |

### Exemple de code

```javascript
const issuer = 'gm';
const type = 'proposal';
const proposalId = '7654321';
const callbackUrl = 'https://monapp.com/confirmation';

const paymentUrl =
  `https://payment.clubmed.com/${issuer}/${type}/${proposalId}` +
  `?callback_url=${encodeURIComponent(callbackUrl)}`;

window.location.href = paymentUrl;
```

### URL générée

```
https://payment.clubmed.com/gm/proposal/7654321?callback_url=https%3A%2F%2Fmonapp.com%2Fconfirmation
```

</TabItem>
</Tabs>

## Canaux (issuers)

### GM

Canal client principal pour les réservations grand public.

### GO

Canal interne pour les équipes Club Med. Nécessite `callback_url_seller`.

### Partners

Canal dédié aux partenaires Club Med. Nécessite `callback_url_seller`.

## Prochaines étapes

**[→ Gestion du callback](./callback)** - Récupérer le résultat du paiement
