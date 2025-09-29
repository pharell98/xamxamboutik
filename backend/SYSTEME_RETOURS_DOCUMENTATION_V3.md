# 📦 Documentation Claire du Système de Retours (Remboursements & Échanges)

Cette documentation décrit uniquement le système de retours tel qu’il est réellement implémenté. Lisible par non développeurs.

---

## 🎯 Objectifs du système
- Traiter les retours après une vente: remboursement ou échange
- Conserver une facture unique, toujours à jour (sans paiements négatifs)
- Assurer la traçabilité (qui, quand, pourquoi)
- Mettre à jour les stocks correctement selon le type de retour

---

## 🧩 Les objets manipulés
- **Vente**: la transaction globale
- **DetailVente**: une ligne (produit, prix, quantité, montant)
- **RetourProduit**: trace du retour (date, motif, type, opérateur)
- **Paiement**: encaissements POSITIFS (créés à la vente)

Relations clés:
- Une `Vente` contient plusieurs `DetailVente` et `Paiement`
- Un `DetailVente` peut avoir un `RetourProduit` (1:1)

---

## 🔁 États d’une ligne `DetailVente`
- **VENDU**: ligne active, visible et comptée dans la facture
- **RETOURNE_REMBOURSE**: remboursée, **montant mis à 0**, non visible en facture
- **RETOURNE_ECHANGE**:
  - Ancienne ligne neutralisée (montant 0)
  - Nouvelle ligne créée pour le produit de remplacement (statut VENDU)

---

## 🧭 Types de retours pris en charge (réellement codés)
1) **Remboursement avec retour “bon état”**
   - Produit remis en stock
   - Ligne passée à 0 (statut RETOURNE_REMBOURSE)

2) **Remboursement “défectueux”**
   - Produit **non** remis en stock
   - Ligne passée à 0 (statut RETOURNE_REMBOURSE)

3) **Échange “défectueux”**
   - Ancien produit **non** remis en stock
   - Ancienne ligne neutralisée; **nouvelle** ligne créée (VENDU) pour le produit de remplacement

4) **Échange “changement de préférence” (taille, couleur, …)**
   - Ancien produit remis en stock
   - Ancienne ligne neutralisée; **nouvelle** ligne (VENDU) au **même prix**

5) **Échange “ajustement de prix”**
   - Ancien produit remis en stock
   - Ancienne ligne neutralisée; **nouvelle** ligne (VENDU) au **nouveau prix**

À chaque retour: un `RetourProduit` est enregistré (date, motif, type, utilisateur).

---

## 🏷️ Règles de stock
- Remboursement bon état: **+quantité** en stock
- Remboursement défectueux: stock **inchangé**
- Échange défectueux: ancien **non remis**, nouveau **décrémenté**
- Échange changement préférence: ancien **remis**, nouveau **décrémenté**
- Échange avec ajustement: idem changement préférence (ancien remis, nouveau décrémenté)

---

## 💶 Règles financières (sans paiements négatifs)
- **Jamais** de paiement négatif créé
- Le total de la vente/facture = **somme** des `DetailVente.montantTotal` **actuels**
- Les lignes remboursées/anciennes échangées ont **montant = 0** → **non affichées**
- Si vente à crédit: **reste à payer** recalculé = max(0, total - paiements positifs)

Conséquence: **une seule facture**, qui évolue (ex: 70 → 60 → 40) sans montants négatifs.

---

## 🧾 Ce que la facture affiche
- Inclus:
  - Lignes **VENDU**
  - Nouvelles lignes d’échange (**RETOURNE_ECHANGE** avec montant > 0)
- Exclus:
  - Lignes **RETOURNE_REMBOURSE** (montant 0)
  - Anciennes lignes d’échange (montant 0)
- Mode “Clean”: exclut strictement les produits liés à des **défauts** (retours défectueux)

---

## 🧠 Sécurité & Validations
- Un même `DetailVente` ne peut pas être retourné **deux fois**
- La **quantité retournée** ≤ quantité vendue
- Champs requis et formats strictement validés (motif non vide, quantités > 0, …)

---

## 🔌 Endpoints “Retours” (principaux)
- **Remboursements**
  - POST `/retours/remboursement/avec-retour-bon-etat`
  - POST `/retours/remboursement/defectueux`
  - DTO: `RemboursementRequestDTO { detailVenteId, motif, quantiteRetour }`

- **Échanges**
  - POST `/retours/echange/defectueux`
  - POST `/retours/echange/changement-preference`
  - POST `/retours/echange/ajustement-prix`
  - DTO: `EchangeRequestDTO { detailVenteId, motif, quantiteRetour, produitRemplacementId }`

---

## 🧪 Exemple réel (simple)
- Vente initiale: 1 × 70 → facture **70**
- Remboursement de 10: la ligne passe à **0** → facture **60**
- Remboursement de 20: une autre ligne passe à **0** → facture **40**
- Toujours **1 facture**, montant final clair. **Aucun** paiement négatif.

---

## 🛠️ Ce que fait le système en coulisses
- Met à jour précisément les `DetailVente` (statut/quantité/montant)
- Ajuste le **stock** selon le type
- Recalcule le **total** de la vente à chaque opération
- Enregistre un `RetourProduit` (traçabilité complète)
- Met à jour la **caisse** en temps réel (ventes/pertes journalières)

---

## ❓ FAQ
- **Pourquoi pas de montants négatifs ?**
  - Les retours agissent sur les **lignes**, pas sur les paiements. Le total final est clair.
- **Comment prouver un retour ?**
  - Via `RetourProduit`: date, motif, type, utilisateur sont **enregistrés**.
- **Comment obtenir une facture “propre” sans défauts ?**
  - Utilisez l’endpoint **Clean** côté factures.

---

## 🧷 À retenir
- 1 vente = **1 facture** toujours à jour
- Retours → modification des **lignes**, pas de paiements négatifs
- Total = somme des **lignes actives**
- Traçabilité & stock fiables

---

_Aligné avec: `RetourController`, `RetourService`, `DetailVente`, `RetourProduit`, `FactureRepository` (règles d’affichage), et recalcul métier dans `RetourService.updateVenteMontants`._
