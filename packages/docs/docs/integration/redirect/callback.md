---
sidebar_position: 3
---

# Gestion du callback

Après le paiement, l'utilisateur est automatiquement redirigé vers votre `callback_url` avec des paramètres ajoutés dans l'URL.

## Paramètres de retour

L'URL de callback reçoit ces paramètres :

| Paramètre        | Type   | Description                      | Exemple                                                               |
| ---------------- | ------ | -------------------------------- | --------------------------------------------------------------------- |
| `payment_status` | string | Statut du paiement               | `OK`, `PENDING`, `REFUSED_PSP`, `REFUSED_CM`, `CANCELED`, `CANCELLED` |
| `booking_id`     | string | ID de la réservation (optionnel) | `1234567`                                                             |
| `proposal_id`    | string | ID de la proposition (optionnel) | `7654321`                                                             |
| `payment_id`     | string | ID du paiement                   | `9876543`                                                             |
| `amount`         | number | Montant payé                     | `1500.00`                                                             |
| `currency`       | string | Devise                           | `EUR`                                                                 |

## Exemple d'URL de retour

```
https://monapp.com/confirmation?payment_status=OK&booking_id=1234567&payment_id=9876543&amount=1500.00&currency=EUR
```

Décomposition des paramètres :

- `payment_status=OK` - Statut du paiement
- `booking_id=1234567` - ID de la réservation
- `payment_id=9876543` - ID du paiement
- `amount=1500.00` - Montant payé
- `currency=EUR` - Devise

## Statuts de paiement

### OK

Paiement accepté et validé avec succès.

### PENDING

Paiement en cours de traitement (virements bancaires, paiements différés).

### REFUSED_PSP

Refusé par le provider de paiement (fonds insuffisants, carte invalide, 3D Secure échoué, etc.).

### REFUSED_CM

Refusé par les règles métier Club Med (montant invalide, délai expiré, réservation déjà payée).

### CANCELED / CANCELLED

Paiement annulé par l'utilisateur ou timeout de la session

## Prochaines étapes

**[→ Exemples complets](./examples)** - Intégrations complètes par technologie
