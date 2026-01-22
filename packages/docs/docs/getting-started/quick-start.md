---
sidebar_position: 2
---

# Quick Start

Le Caps SDK peut être consommé de **deux façons** selon vos besoins :

## 🔗 Mode Redirection (Simple)

**Pour qui ?** Applications qui veulent déléguer tout le parcours de paiement.

**Comment ?** Rediriger l'utilisateur vers l'URL de paiement hébergée par Club Med.

```
https://payment.clubmed.com/{issuer}/{type}/{id}
```

**Avantages :**

- ✅ Zéro maintenance
- ✅ Mise à jour automatique
- ✅ Sécurité garantie

**[→ Guide complet Mode Redirection](../integration/redirect/configuration)**

---

## ⚛️ Mode Intégré (Personnalisé)

**Pour qui ?** Applications React qui veulent intégrer les composants de paiement dans leur interface.

**Comment ?** Installer le SDK npm et utiliser les composants React.

```bash
pnpm add @clubmed/caps
```

**Avantages :**

- ✅ Contrôle total de l'interface
- ✅ Intégration native dans votre app
- ✅ Composants React réutilisables
- ✅ TypeScript inclus

**[→ Guide complet Mode Intégré](../integration/integrated/installation)**

---

## Comparaison

| Critère                 | Mode Redirection | Mode Intégré     |
| ----------------------- | ---------------- | ---------------- |
| **Complexité**          | Très simple      | Modérée          |
| **Technologies**        | Toutes           | React uniquement |
| **Contrôle UI**         | Limité           | Total            |
| **Maintenance**         | Aucune           | Mise à jour npm  |
| **Temps d'intégration** | 5 minutes        | 30 minutes       |

---

## Choisir son mode

### Utilisez le **Mode Redirection** si :

- Vous voulez la solution la plus simple
- Votre application n'est pas en React
- Vous n'avez pas besoin de personnaliser l'interface
- Vous voulez zéro maintenance

### Utilisez le **Mode Intégré** si :

- Vous voulez personnaliser l'expérience utilisateur
- Vous voulez intégrer le paiement dans votre flow existant
