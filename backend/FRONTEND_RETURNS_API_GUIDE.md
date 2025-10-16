# Frontend Guide – Returns & Exchanges API (v3)

Objectif: donner au frontend les contrats simples (endpoints, payloads, réponses attendues) pour implémenter remboursements & échanges sans ambiguïté.

---

## Principes clés (à connaître côté UI)
- Une facture est unique et se met à jour automatiquement après un retour/échange.
- AUCUN paiement négatif n’est créé. Le total = somme des lignes actives.
- Remboursement bon état → remise en stock; défectueux → pas de remise en stock.
- Échange → l’ancienne ligne est neutralisée, une nouvelle ligne est créée.

---

## Endpoints Retour (base path: `/retours`)

### 1) Remboursements (explicites)
POST `/retours/remboursement/avec-retour-bon-etat`
POST `/retours/remboursement/defectueux`

Body (JSON):
```json
{
  "detailVenteId": 123,
  "motif": "Client insatisfait",
  "quantiteRetour": 1
}
```
Réponse (succès):
```json
{
  "success": true,
  "message": "Remboursement créé avec succès",
  "data": null
}
```

Erreurs usuelles (HTTP 400/422):
- `quantiteRetour` > quantité vendue
- `detailVenteId` déjà retourné
- `motif` manquant

---

### 2) Échanges (explicites)
POST `/retours/echange/defectueux`
POST `/retours/echange/changement-preference`
POST `/retours/echange/ajustement-prix`

Body (JSON):
```json
{
  "detailVenteId": 124,
  "motif": "Changement de taille",
  "quantiteRetour": 1,
  "produitRemplacementId": 456
}
```
Réponse (succès):
```json
{
  "success": true,
  "message": "Échange créé avec succès",
  "data": null
}
```

Erreurs usuelles (HTTP 400/422):
- `produitRemplacementId` manquant
- `quantiteRetour` > quantité vendue
- `detailVenteId` déjà retourné

---

## Données d’entrée – DTOs (côté Front)

### RemboursementRequestDTO
```ts
interface RemboursementRequestDTO {
  detailVenteId: number;      // requis
  motif: string;              // requis (non vide)
  quantiteRetour: number;     // >= 1
}
```

### EchangeRequestDTO
```ts
interface EchangeRequestDTO {
  detailVenteId: number;         // requis
  motif: string;                 // requis (non vide)
  quantiteRetour: number;        // >= 1
  produitRemplacementId: number; // requis
}
```

---

## Après succès: rafraîchir la facture
- Appeler l’endpoint facture correspondant (par numéro) pour afficher le **montant final** et la liste des lignes actives.
- Endpoints utiles (base path: `/factures`):
  - GET `/factures/{numeroFacture}` – affichage standard (intelligent)
  - GET `/factures/{numeroFacture}/clean` – exclut les produits liés à des défauts

Réponse (extrait):
```json
{
  "success": true,
  "message": "Facture récupérée avec succès",
  "data": {
    "numeroFacture": "FAC-18-09-25-0001",
    "dateVenteFormatted": "18-09-2025",
    "montantTotal": 140.0,
    "montantRestant": 0.0,
    "detailFacture": [
      { "libelle": "Pantalon Premium", "quantite": 1, "prix": 60.0, "montantTotal": 60.0 }
    ]
  }
}
```

---

## UX suggérée
1) Dans la facture, sur chaque ligne vendue, afficher des actions “Rembourser” / “Échanger”.
2) Ouvrir un modal pour saisir `motif`, `quantiteRetour` et éventuellement `produitRemplacementId`.
3) Après succès, rafraîchir la facture et afficher un toast de confirmation.
4) Pour les retours d’items défectueux, proposer le mode “Clean” d’affichage de facture.

---

## Codes d’erreurs fréquents (à mapper côté UI)
- 400 / 422: données invalides (motif vide, quantité > vendue, etc.)
- 404: `detailVenteId` introuvable ou facture introuvable
- 409: état invalide (retour déjà effectué)
- 500: erreur inattendue (afficher message générique et remonter logs)

---

## Check-list d’intégration Front
- [ ] Valider les champs requis avant POST
- [ ] Gérer les toasts de succès/erreur
- [ ] Rafraîchir la facture après succès
- [ ] Adapter l’UI selon type de retour (bon état vs défectueux; échange vs remboursement)
- [ ] Option d’affichage clean pour factures avec produits défectueux

---

## Notes
- Aucun paiement négatif n’est attendu dans les réponses
- Le montant affiché en facture est **le montant final** après retours/échanges
