---
sidebar_position: 1
sidebar_label: Introduction
slug: /
---

# ClubMed CAPS SDK

**Centralized Autonomous Payment System**

Solution officielle Club Med pour intégrer les paiements dans vos applications.

## Deux façons d'intégrer le paiement

![Workflow CAPS](/img/caps-workflow.png)

### 🔗 Option 1 : Mode Redirection

Redirigez vos utilisateurs vers notre page de paiement hébergée.

**Avantages :**

- ✅ **Rapide** : Intégration en 5 minutes
- ✅ **Simple** : Juste une redirection URL
- ✅ **Aucune maintenance** : Interface gérée par Club Med
- ✅ **Universel** : Compatible avec toute technologie (React, Vue, Angular, PHP, etc.)

![Workflow CAPS](/img/caps-redirect-workflow.png)

**Exemple :**

```javascript
const paymentUrl =
  `https://payment.clubmed.com/gm/booking/1234567` +
  `?customer_id=789&callback_url=https://myapp.com/confirmation`;

window.location.href = paymentUrl;
```

**[→ Guide complet du mode redirection](./integration/redirect/configuration)**

---

### ⚛️ Option 2 : Mode SDK React

Intégrez les composants React directement dans votre application.

**Avantages :**

- ✅ **Personnalisable** : Contrôle total du design
- ✅ **UX fluide** : L'utilisateur reste dans votre app
- ✅ **Intégration native** : Composants React prêts à l'emploi

![Workflow CAPS](/img/caps-sdk-workflow.png)

**Exemple :**

```tsx
import { FormProvider, PaymentSchedule, PaymentProviders } from '@clubmed/caps';

<FormProvider issuer="gm" type="booking" id="1234567">
  <PaymentSchedule />
  <PaymentProviders />
  <button type="submit">Payer</button>
</FormProvider>;
```

**[→ Guide complet du mode SDK](./integration/integrated/installation)**

---

## Quelle option choisir ?

| Critère                 | Mode Redirection    | Mode SDK React         |
| ----------------------- | ------------------- | ---------------------- |
| **Temps d'intégration** | 5 minutes           | 30 minutes             |
| **Technologie requise** | Aucune              | React 18+              |
| **Personnalisation**    | Limitée             | Totale                 |
| **Maintenance**         | Aucune              | Mise à jour du package |
| **UX**                  | Redirection externe | Intégration native     |

**Recommandation :**

- 🔗 **Mode Redirection** : Si vous voulez la solution la plus simple et rapide
- ⚛️ **Mode SDK** : Si vous avez une app React et voulez une intégration personnalisée

---

## Quick Start

### Mode Redirection (5 minutes)

1. Construisez l'URL de paiement :

   ```
   https://payment.clubmed.com/{issuer}/{type}/{id}?customer_id={id}&callback_url={url}
   ```

2. Redirigez l'utilisateur vers cette URL

3. Récupérez les résultats sur votre `callback_url`

**[→ Voir le guide détaillé](./integration/redirect/configuration)**

---

### Mode SDK React (30 minutes)

1. Installez le package :

   ```bash
   npm install @clubmed/caps
   ```

2. Utilisez les composants :
   ```tsx
   <PaymentConfigProvider {...config}>
     <Form>
       <PaymentSchedule />
       <PaymentProviders />
       <Cgv />
     </Form>
   </PaymentConfigProvider>
   ```

**[→ Voir le guide détaillé](./integration/integrated/installation)**

---

## Prochaines étapes

1. **[Quick Start](./getting-started/quick-start)** - Commencez rapidement avec les deux modes
2. **[Mode Redirection](./integration/redirect/configuration)** - Intégration simple par redirection
3. **[Mode Intégré](./integration/integrated/installation)** - Intégration avancée avec composants React

---

## Support

- **Documentation** : Vous êtes dessus !
- **Issues** : [GitLab Issues](https://scm.clubmed.com/clubmed/ui/cm-payment/-/issues)

---

## Canaux supportés

Le SDK supporte trois canaux (issuers) :

- **GM** : Canal client principal
- **GO** : Canal interne pour les équipes Club Med
- **Partners** : Canal partenaires

Chaque canal a des composants et des workflows spécifiques. Consultez la documentation pour plus de détails.
