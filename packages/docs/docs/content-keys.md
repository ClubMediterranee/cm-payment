---
sidebar_position: 100
title: Clés de contenu
description: Référence complète des clés de contenu pour personnaliser les textes du SDK
---

## Introduction

Les clés de contenu permettent de personnaliser tous les textes affichés dans le SDK de paiement.
Chaque clé peut contenir des variables qui seront remplacées dynamiquement.

## Utilisation

Pour personnaliser le contenu, passez un objet `content` à votre composant :

```tsx
import { CapsForm } from '@clubmed/caps';

const content = {
  paymentProviders: {
    creditCard: {
      label: 'Je paie par carte bancaire le montant de {amount}',
    },
  },
};

<CapsForm content={content} />;
```

---

import ContentKeysTables from './content-keys-tables.md';

<ContentKeysTables />
