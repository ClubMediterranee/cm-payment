---
sidebar_position: 2
---

# Formulaire de paiement

## Le composant Form

Le SDK CAPS utilise un composant `<Form>` qui englobe tous les composants de paiement. Ce formulaire gère la soumission, la communication avec l'API Club Med, la gestion d'erreurs et le chargement.

Tous les composants de paiement doivent être placés à l'intérieur du `<PaymentConfigProvider>` et du `<Form>` pour fonctionner correctement.

## Composants requis selon le canal (issuer)

Le SDK s'adapte automatiquement selon le canal (issuer) configuré dans `PaymentConfigProvider`.

<div style={{width: '100%', overflowX: 'auto'}}>

| Composant                                                                                                                               | GM  | GO  | PARTNERS |
| --------------------------------------------------------------------------------------------------------------------------------------- | --- | --- | -------- |
| [`<PaymentSchedule />`](https://cm-payment-staging-ca98dc5783da.herokuapp.com/storybook/?path=/docs/components-paymentschedule--docs)   | ✅  | ✅  | ✅       |
| [`<PaymentProviders />`](https://cm-payment-staging-ca98dc5783da.herokuapp.com/storybook/?path=/docs/components-paymentproviders--docs) | ✅  | ✅  | ✅       |
| [`<Cgv />`](https://cm-payment-staging-ca98dc5783da.herokuapp.com/storybook/?path=/docs/components-cgv--docs)                           | ✅  | ✅  | ✅       |
| [`<CardForm />`](https://cm-payment-staging-ca98dc5783da.herokuapp.com/storybook/?path=/docs/components-cardform--docs)                 | ✅  | ❌  | ❌       |
| [`<ContactChoice />`](https://cm-payment-staging-ca98dc5783da.herokuapp.com/storybook/?path=/docs/components-contactchoice--docs)       | ❌  | ✅  | ✅       |

</div>

## Props du composant Form

Le composant `<Form>` accepte plusieurs props pour personnaliser son comportement :

| Prop            | Type                     | Requis | Description                                   |
| --------------- | ------------------------ | ------ | --------------------------------------------- |
| `action`        | `Action`                 | ❌ Non | Action de paiement (ex: `PAYMENT_SOLDE`)      |
| `onError`       | `(error: Error) => void` | ❌ Non | Callback appelé en cas d'erreur de soumission |
| `onLoad`        | `() => void`             | ❌ Non | Callback appelé au début de la soumission     |
| `onLoadEnd`     | `() => void`             | ❌ Non | Callback appelé à la fin de la soumission     |
| `fallback`      | `ReactNode`              | ❌ Non | Composant de chargement personnalisé          |
| `errorFallback` | `FallbackComponent`      | ❌ Non | Composant d'erreur personnalisé               |

:::info Action par défaut
Si `action` n'est pas spécifié, le SDK résout automatiquement l'action selon le contexte :

- Pour les **bookings** : `PAYMENT_SOLDE` par défaut
- Pour les **proposals** : `PAYMENT_RESA` automatique
  :::

## Prochaines étapes

**[→ Exemples complets](./examples)** - Intégrations complètes par canal
