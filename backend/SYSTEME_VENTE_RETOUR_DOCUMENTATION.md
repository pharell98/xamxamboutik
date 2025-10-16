# 📋 Documentation Complète du Système de Vente et Retour
## XamXamBoutik - Version 3.0 (Système Optimisé Sans Paiements Négatifs)

---

## 📖 Table des Matières

1. [Vue d'Ensemble du Système](#vue-densemble)
2. [Architecture Technique](#architecture)
3. [Modèle de Données](#modele-donnees)
4. [Nouveau Système de Calcul](#nouveau-systeme-calcul)
5. [Système de Vente](#systeme-vente)
6. [Système de Retour](#systeme-retour)
7. [Système de Facturation](#systeme-facturation)
8. [API et Endpoints](#api-endpoints)
9. [Exemples Pratiques](#exemples)
10. [Optimisations et Bonnes Pratiques](#optimisations)

---

## 🎯 Vue d'Ensemble du Système {#vue-densemble}

### Objectif Principal
Le système de vente et retour de XamXamBoutik est une solution complète de gestion commerciale révolutionnée pour éliminer les confusions liées aux montants négatifs dans les factures.

### Problème Résolu
**Avant (Version 2.0) :**
- Vente de 70€ → Retour de 10€ → Retour de 20€
- Résultat : 3 factures (70€, -10€, -20€) avec des montants négatifs confus

**Maintenant (Version 3.0) :**
- Vente de 70€ → Retour de 10€ → Retour de 20€
- Résultat : 1 facture unique qui affiche 70€ → 60€ → 40€ (montant final clair)

### Fonctionnalités Clés
- ✅ **Factures unifiées** : Une seule facture par vente, mise à jour automatiquement
- ✅ **Montants finaux clairs** : Plus de paiements négatifs, montant final direct
- ✅ **Calcul automatique** : Recalcul intelligent basé sur les DetailVente
- ✅ **Gestion des stocks** en temps réel avec tous types de retours
- ✅ **Traçabilité complète** : Historique des retours conservé
- ✅ **Notifications WebSocket** en temps réel

---

## 🏗️ Architecture Technique {#architecture}

### Principe Architectural Révolutionné
Le système utilise maintenant une **approche de recalcul intelligent** qui :
- **Élimine les paiements négatifs** : Plus de confusion avec des montants -X€
- **Centralise les calculs** : Montant = Somme des DetailVente actuels
- **Maintient la cohérence** : Recalcul complet à chaque opération
- **Simplifie l'affichage** : Une facture = un montant final

### Structure des Couches

#### 🌐 **Couche Présentation (Controllers)**
**Composants principaux :**
- `VenteController` : Création de ventes et rapports de performance
- `RetourController` : Gestion des remboursements et échanges
- `FactureController` : Consultation et génération de factures intelligentes

#### 🧠 **Couche Métier (Services)**
**Nouveautés Version 3.0 :**
- `VenteService` : Création avec génération automatique de numéro de facture
- `RetourService` : **RÉVOLUTIONNÉ** - Plus de paiements négatifs, recalcul intelligent
- `FactureService` : Affichage intelligent excluant les produits retournés

#### 💾 **Couche Données (Repositories)**
**Optimisations apportées :**
- `VenteRepository` : Requêtes optimisées pour rapports de performance
- `FactureRepository` : Requêtes intelligentes pour affichage des factures
- `RetourProduitRepository` : Traçabilité des retours pour audit
- `PaiementRepository` : Gestion uniquement des paiements positifs

#### 🗃️ **Couche Entités (Entities)**
**Relations optimisées :**
- `Vente` ↔ `DetailVente` (1:N) : Calcul basé sur la somme des DetailVente
- `Vente` ↔ `Paiement` (1:N) : Uniquement paiements positifs conservés
- `DetailVente` ↔ `RetourProduit` (1:1) : Traçabilité des retours
- `DetailVente` ↔ `Produit` (N:1) : Gestion automatique des stocks

---

## 📊 Modèle de Données {#modele-donnees}

### Entités Principales

#### 🛒 **Entité Vente - Le Cœur du Système**

```java
@Entity
@Table(name = "ventes")
public class Vente extends BaseEntity {
    private LocalDateTime date;                    // Date de création
    private Double montantTotal;                   // CALCULÉ automatiquement
    private Double montantRestant;                 // Pour ventes à crédit
    private Boolean estCredit = false;             // Indicateur crédit
    private String numeroFacture;                  // FAC-JJ-MM-AA-XXXX
    
    @ManyToOne private Client client;              // Client (optionnel)
    @ManyToOne private Utilisateur utilisateur;    // Vendeur
    @OneToMany private Set<DetailVente> detailVentes;  // Lignes de vente
    @OneToMany private Set<Paiement> paiements;        // Paiements POSITIFS uniquement
}
```

**Nouveautés Version 3.0 :**
- ✅ **Montant total calculé** = Somme des `DetailVente.montantTotal`
- ✅ **Paiements positifs uniquement** : Fini les montants négatifs
- ✅ **Numérotation automatique** : Format FAC-JJ-MM-AA-XXXX

#### 📋 **Entité DetailVente - Les Lignes Intelligentes**

```java
@Entity
@Table(name = "detail_ventes")
public class DetailVente extends BaseEntity {
    private Double prixVente;                      // Prix unitaire
    private Integer quantiteVendu;                 // Quantité (ajustée lors des retours)
    private Double montantTotal;                   // Prix × Quantité (mis à 0 si retourné)
    private StatusDetailVente status = VENDU;      // État de la ligne
    
    @ManyToOne private Vente vente;                // Vente parente
    @ManyToOne private Produit produit;            // Produit concerné
}
```

**États possibles :**
- `VENDU` : Produit vendu normalement (montantTotal > 0)
- `RETOURNE_REMBOURSE` : Produit remboursé (montantTotal = 0)
- `RETOURNE_ECHANGE` : Produit échangé (montantTotal = 0 pour l'ancien, > 0 pour le nouveau)

**Logique révolutionnaire :**
- **Retour total** : `montantTotal` → 0€ (au lieu de créer un paiement négatif)
- **Retour partiel** : `quantiteVendu` réduite + recalcul du `montantTotal`

#### 💰 **Entité Paiement - Simplifiée**

```java
@Entity
@Table(name = "paiements")
public class Paiement extends BaseEntity {
    private LocalDateTime datePaiement;            // Date du paiement
    private Double montantVerser;                  // TOUJOURS POSITIF maintenant
    private ModePaiement modePaiement;             // Mode utilisé
    
    @ManyToOne private Vente vente;                // Vente concernée
}
```

**Changements Version 3.0 :**
- ❌ **Plus de montants négatifs** : Suppression des paiements de remboursement
- ✅ **Paiements positifs uniquement** : Paiement initial + éventuels ajustements positifs
- ✅ **Simplicité** : Un paiement = un encaissement réel

#### 🔄 **Entité RetourProduit - Traçabilité Complète**

```java
@Entity
@Table(name = "retour_produits")
public class RetourProduit extends BaseEntity {
    private LocalDateTime dateRetour;              // Date du retour
    private String motif;                          // Raison du retour
    private String typeRetour;                     // Type de retour
    
    @OneToOne private DetailVente detailVente;     // Ligne concernée
    @ManyToOne private Utilisateur utilisateurRetour; // Qui a fait le retour
}
```

**Types de retours gérés :**
- `REMBOURSEMENT_AVEC_RETOUR_BON_ETAT`
- `REMBOURSEMENT_DEFECTUEUX`
- `ECHANGE_DEFECTUEUX`
- `ECHANGE_CHANGEMENT_PREFERENCE`
- `ECHANGE_AJUSTEMENT_PRIX`

---

## 🔄 Nouveau Système de Calcul {#nouveau-systeme-calcul}

### Principe Révolutionnaire

#### **Ancien Système (Version 2.0) :**
```java
// Problématique : Paiements négatifs
Vente: 70€
Paiement initial: +70€
Retour 1: Paiement -10€
Retour 2: Paiement -20€
Total = 70 - 10 - 20 = 40€
```

#### **Nouveau Système (Version 3.0) :**
```java
// Solution : Recalcul basé sur les DetailVente
Vente initiale: 3 produits (10€ + 20€ + 40€ = 70€)
Retour produit 1: DetailVente.montantTotal = 0€
Retour produit 2: DetailVente.montantTotal = 0€
Montant facture = 0€ + 0€ + 40€ = 40€
```

### Méthode de Recalcul Automatique

```java
private void updateVenteMontants(Vente vente, double montantModifie) {
    // NOUVEAU : Recalcul basé sur les DetailVente actuels
    double nouveauMontantTotal = vente.getDetailVentes().stream()
            .mapToDouble(DetailVente::getMontantTotal)
            .sum();
    
    vente.setMontantTotal(nouveauMontantTotal);
    
    if (vente.getEstCredit()) {
        // Calculer uniquement avec les paiements POSITIFS
        double montantTotalPaye = vente.getPaiements().stream()
                .filter(p -> p.getMontantVerser() > 0)  // NOUVEAU : Filtre positifs
                .mapToDouble(Paiement::getMontantVerser)
                .sum();
        
        vente.setMontantRestant(Math.max(0.0, nouveauMontantTotal - montantTotalPaye));
    } else {
        vente.setMontantRestant(0.0);
    }
    
    venteRepository.save(vente);
}
```

### Avantages du Nouveau Système

| Aspect | Ancien Système | Nouveau Système |
|--------|----------------|-----------------|
| **Clarté** | 3 factures (70€, -10€, -20€) | 1 facture (70€ → 40€) |
| **Compréhension** | Confus pour le client | Immédiatement clair |
| **Calculs** | Risque d'incohérence | Toujours cohérent |
| **Affichage** | Montants négatifs | Montant final direct |
| **Maintenance** | Complexe | Simplifié |

---

## 🛒 Système de Vente {#systeme-vente}

### Processus de Création d'une Vente

#### **1. Réception et Validation**
```java
@PostMapping
public ResponseEntity<ApiResponse<Void>> createVente(@Valid @RequestBody VenteRequestDTO dto) {
    venteService.createVente(dto);
    return ResponseEntity.ok(ApiResponse.success("Vente créée avec succès", null));
}
```

#### **2. Traitement Automatique**
Le `VenteService.createVente()` effectue :

```java
public Vente createVente(VenteRequestDTO dto) {
    // 1. Préparation de la vente
    Vente vente = venteMapper.toEntity(dto);
    vente.setDate(LocalDateTime.now());
    vente.setUtilisateur(currentUserService.getCurrentUser());
    vente.setNumeroFacture(generateNumeroFacture()); // FAC-JJ-MM-AA-XXXX
    
    // 2. Traitement de chaque produit
    List<DetailVente> detailVentes = new ArrayList<>();
    double totalMontant = 0.0;
    
    for (DetailVenteRequestDTO detailDTO : dto.getDetailVenteList()) {
        // Validation du produit et du stock
        Produit produit = produitRepository.findById(detailDTO.getProduitId())
            .orElseThrow(() -> new EntityNotFoundException("Produit introuvable"));
        
        if (produit.getStockDisponible() < detailDTO.getQuantiteVendu()) {
            throw new BaseCustomException("Stock insuffisant");
        }
        
        // Réservation immédiate du stock
        produit.setStockDisponible(produit.getStockDisponible() - detailDTO.getQuantiteVendu());
        
        // Création du DetailVente
        DetailVente detailVente = new DetailVente();
        detailVente.setVente(vente);
        detailVente.setProduit(produit);
        detailVente.setPrixVente(detailDTO.getPrixVente());
        detailVente.setQuantiteVendu(detailDTO.getQuantiteVendu());
        detailVente.setMontantTotal(detailDTO.getPrixVente() * detailDTO.getQuantiteVendu());
        detailVente.setStatus(StatusDetailVente.VENDU);
        
        detailVentes.add(detailVente);
        totalMontant += detailVente.getMontantTotal();
    }
    
    // 3. Finalisation
    vente.setMontantTotal(totalMontant);
    vente.setDetailVentes(new HashSet<>(detailVentes));
    
    // 4. Création du paiement initial (POSITIF)
    Paiement paiement = new Paiement();
    paiement.setDatePaiement(LocalDateTime.now());
    paiement.setMontantVerser(totalMontant);  // TOUJOURS POSITIF
    paiement.setModePaiement(dto.getModePaiement());
    paiement.setVente(vente);
    vente.getPaiements().add(paiement);
    
    // 5. Sauvegarde et notification
    Vente savedVente = venteRepository.save(vente);
    notifyUpdate(savedVente);  // WebSocket
    return savedVente;
}
```

#### **3. Génération Automatique du Numéro de Facture**

Format : `FAC-JJ-MM-AA-XXXX`

```java
private String generateNumeroFacture() {
    LocalDateTime now = LocalDateTime.now();
    String prefix = "FAC-" + 
        String.format("%02d", now.getDayOfMonth()) + "-" +
        String.format("%02d", now.getMonthValue()) + "-" +
        String.format("%02d", now.getYear() % 100) + "-";
    
    // Recherche du dernier numéro du jour
    Optional<String> lastNumero = venteRepository.findLastNumeroFactureByPrefix(prefix);
    
    int sequence = 1;
    if (lastNumero.isPresent()) {
        String sequenceStr = lastNumero.get().substring(lastNumero.get().lastIndexOf("-") + 1);
        sequence = Integer.parseInt(sequenceStr) + 1;
    }
    
    return prefix + String.format("%04d", sequence);
}
```

**Exemples :**
- `FAC-18-09-25-0001` : Première vente du 18 septembre 2025
- `FAC-18-09-25-0042` : 42ème vente du même jour

---

## 🔄 Système de Retour {#systeme-retour}

### ✅ Principes clés (fidèles au code)
- **Aucun paiement négatif n'est créé** pendant un retour.
- Les retours **modifient les lignes (DetailVente)** : statut, quantité, montant.
- Le **total** de la vente/facture est **recalculé** après chaque retour.
- Un objet `RetourProduit` garde **la trace** (date, motif, type, utilisateur).
- Le **stock** est mis à jour selon le **type** de retour.

### 🧭 Types de retours
1) **Remboursement – bon état**
   - Stock: **remis**
   - Ligne: statut `RETOURNE_REMBOURSE`, **montant = 0** (ou quantité réduite)

2) **Remboursement – défectueux**
   - Stock: **non remis**
   - Ligne: statut `RETOURNE_REMBOURSE`, **montant = 0** (ou quantité réduite)

3) **Échange – défectueux**
   - Ancien: **non remis** en stock → ligne neutralisée (**montant = 0**)
   - Nouveau: **nouvelle** ligne `VENDU` créée (produit de remplacement)

4) **Échange – changement de préférence**
   - Ancien: **remis** en stock → ligne neutralisée (**montant = 0**)
   - Nouveau: **nouvelle** ligne `VENDU` au **même prix**

5) **Échange – ajustement de prix**
   - Ancien: **remis** en stock → ligne neutralisée (**montant = 0**)
   - Nouveau: **nouvelle** ligne `VENDU` au **nouveau prix**

### 🏷️ Affichage en facture (logique actuelle)
- **Inclus**: lignes `VENDU` + **nouvelles** lignes d’échange (`RETOURNE_ECHANGE` avec **montant > 0**)
- **Exclus**: lignes `RETOURNE_REMBOURSE` et **anciennes** lignes d’échange (montant = 0)
- **Mode Clean**: exclut strictement les produits liés à des **défauts** (retours défectueux)

### 🔐 Garde-fous & validations
- Un même `DetailVente` ne peut pas être **retourné deux fois**
- `quantiteRetour` **≤** quantité vendue
- Champs obligatoires vérifiés (ex: **motif** non vide)

### 🔌 Endpoints Retours (rappel)
- Remboursements
  - POST `/retours/remboursement/avec-retour-bon-etat`
  - POST `/retours/remboursement/defectueux`
- Échanges
  - POST `/retours/echange/defectueux`
  - POST `/retours/echange/changement-preference`
  - POST `/retours/echange/ajustement-prix`
- DTOs: `RemboursementRequestDTO`, `EchangeRequestDTO`

Pour une version courte dédiée aux retours, voir `SYSTEME_RETOURS_DOCUMENTATION_V3.md`.

---

## 🧾 Système de Facturation {#systeme-facturation}

### Logique d'Affichage Intelligente

#### **Principe**
Les factures affichent uniquement les produits avec `montantTotal > 0` :

```sql
SELECT dv.id AS detailVenteId,
       p.libelle AS libelleProduit,
       dv.quantiteVendu AS quantiteVendu,
       dv.prixVente AS prixVente,
       dv.montantTotal AS montantTotal,
       dv.status AS status
FROM DetailVente dv
JOIN dv.vente v
JOIN dv.produit p
WHERE v.id = :venteId
AND v.deleted = false
AND (
    dv.status = 'VENDU' 
    OR (dv.status = 'RETOURNE_ECHANGE' AND dv.montantTotal > 0)
)
ORDER BY dv.id ASC
```

#### **Modes d'Affichage**

**Mode Standard** : `GET /factures/{numeroFacture}`
- Affiche tous les produits actuellement valides
- Inclut les nouveaux produits d'échange

**Mode Clean** : `GET /factures/{numeroFacture}/clean`
- Exclut complètement les produits liés à des défauts
- Idéal pour les factures finales clients

```sql
-- Mode Clean : Exclut les produits défectueux
SELECT dv.* FROM DetailVente dv
LEFT JOIN RetourProduit rp ON rp.detailVente.id = dv.id
WHERE v.id = :venteId
AND v.deleted = false
AND (
    (dv.status = 'VENDU' AND (rp.id IS NULL OR rp.typeRetour NOT IN ('REMBOURSEMENT_DEFECTUEUX', 'ECHANGE_DEFECTUEUX')))
    OR (dv.status = 'RETOURNE_ECHANGE' AND dv.montantTotal > 0)
)
```

### Fonctionnalités Disponibles

#### **Consultation de Factures**
```java
@GetMapping("/{numeroFacture}")
public ResponseEntity<ApiResponse<FactureResponseDTO>> getFactureByNumero(@PathVariable String numeroFacture) {
    FactureResponseDTO facture = factureService.getFactureByNumero(numeroFacture);
    return ResponseEntity.ok(ApiResponse.success("Facture récupérée", facture));
}
```

#### **Listes et Rapports**
- `GET /factures/all` : Toutes les factures avec pagination
- `GET /factures/today` : Factures du jour
- `GET /factures/month` : Factures du mois en cours
- `GET /factures/date/{date}` : Factures d'une date spécifique

---

## 🌐 API et Endpoints {#api-endpoints}

### Endpoints de Vente

#### **Création de Vente**
```http
POST /ventes
Content-Type: application/json

{
  "detailVenteList": [
    {
      "produitId": 1,
      "prixVente": 25.50,
      "quantiteVendu": 2
    },
    {
      "produitId": 2,
      "prixVente": 45.00,
      "quantiteVendu": 1
    }
  ],
  "modePaiement": "CARTE"
}
```

#### **Rapports de Vente**
- `GET /ventes/today` : Ventes du jour avec totaux
- `GET /ventes/last7days` : Ventes des 7 derniers jours
- `GET /ventes/current-month` : Ventes du mois
- `GET /ventes/current-year` : Ventes de l'année
- `GET /ventes/by-date?date=2025-09-18` : Ventes d'une date
- `GET /ventes/all` : Toutes les ventes
- `GET /ventes/produits` : Produits triés par ventes
- `GET /ventes/paiementModes` : Modes de paiement disponibles

### Endpoints de Retour

#### **Remboursements**
```http
POST /retours/remboursement/avec-retour-bon-etat
POST /retours/remboursement/defectueux

{
  "detailVenteId": 123,
  "motif": "Produit défectueux à la livraison",
  "quantiteRetour": 1
}
```

#### **Échanges**
```http
POST /retours/echange/defectueux
POST /retours/echange/changement-preference
POST /retours/echange/ajustement-prix

{
  "detailVenteId": 123,
  "motif": "Client préfère une autre taille",
  "quantiteRetour": 1,
  "produitRemplacementId": 456
}
```

### Endpoints de Facturation

#### **Consultation**
- `GET /factures/{numeroFacture}` : Facture standard
- `GET /factures/{numeroFacture}/clean` : Facture sans produits défectueux
- `GET /factures/exists/{numero}` : Vérification d'existence

#### **Listes**
- `GET /factures/all` : Toutes les factures
- `GET /factures/today` : Factures du jour
- `GET /factures/month` : Factures du mois
- `GET /factures/date/{date}` : Factures d'une date

---

## 💡 Exemples Pratiques {#exemples}

### Scénario Complet : Avant vs Après

#### **Situation Initiale**
Client achète 3 produits :
- T-shirt Bleu : 25€
- Pantalon : 45€  
- Chaussures : 80€
- **Total : 150€**

#### **Étape 1 : Création de la Vente**

**Requête :**
```json
POST /ventes
{
  "detailVenteList": [
    {"produitId": 1, "prixVente": 25.00, "quantiteVendu": 1},
    {"produitId": 2, "prixVente": 45.00, "quantiteVendu": 1},
    {"produitId": 3, "prixVente": 80.00, "quantiteVendu": 1}
  ],
  "modePaiement": "CARTE"
}
```

**Résultat :**
- ✅ Vente créée : `FAC-18-09-25-0001`
- 💰 Montant total : 150,00€
- 📦 Stocks mis à jour automatiquement
- 💳 Paiement positif créé : +150,00€

#### **Étape 2 : Remboursement Produit Défectueux**

**Situation :** T-shirt défectueux, remboursement demandé

**Requête :**
```json
POST /retours/remboursement/defectueux
{
  "detailVenteId": 123,
  "motif": "T-shirt troué à la livraison",
  "quantiteRetour": 1
}
```

**Ancien Système (Version 2.0) :**
- ❌ Paiement négatif créé : -25,00€
- 📊 Total paiements : 150 - 25 = 125€
- 🧾 2 factures : 150€ et -25€

**Nouveau Système (Version 3.0) :**
- ✅ DetailVente T-shirt : montantTotal → 0€
- 📊 Montant facture : 0 + 45 + 80 = 125€
- 🧾 1 seule facture : 150€ → 125€

#### **Étape 3 : Échange avec Ajustement de Prix**

**Situation :** Client échange le pantalon contre un modèle premium (60€)

**Requête :**
```json
POST /retours/echange/ajustement-prix
{
  "detailVenteId": 124,
  "motif": "Préfère le modèle premium",
  "quantiteRetour": 1,
  "produitRemplacementId": 456
}
```

**Ancien Système (Version 2.0) :**
- ❌ Ancien DetailVente : statut → RETOURNE_ECHANGE
- ❌ Paiement d'ajustement : +15,00€
- 📊 Total paiements : 150 - 25 + 15 = 140€
- 🧾 3 factures : 150€, -25€, +15€

**Nouveau Système (Version 3.0) :**
- ✅ Ancien DetailVente pantalon : montantTotal → 0€
- ✅ Nouveau DetailVente premium : montantTotal → 60€
- 📊 Montant facture : 0 + 0 + 80 + 60 = 140€
- 🧾 1 seule facture : 150€ → 125€ → 140€

#### **Étape 4 : Consultation de la Facture Finale**

**Requête :**
```http
GET /factures/FAC-18-09-25-0001
```

**Nouveau Système (Version 3.0) :**
```json
{
  "numeroFacture": "FAC-18-09-25-0001",
  "dateVenteFormatted": "18-09-2025",
  "montantTotal": 140.00,
  "montantRestant": 0.0,
  "detailFacture": [
    { "libelle": "Chaussures Sport", "quantite": 1, "prix": 80.00, "montantTotal": 80.00 },
    { "libelle": "Pantalon Premium", "quantite": 1, "prix": 60.00, "montantTotal": 60.00 }
  ]
}
```

---

## ⚡ Optimisations et Bonnes Pratiques {#optimisations}

### Optimisations Version 3.0

#### **1. Élimination des Paiements Négatifs**
```java
// AVANT : Logique complexe avec paiements négatifs
double totalPaiements = vente.getPaiements().stream()
    .mapToDouble(Paiement::getMontantVerser)  // Peut être négatif
    .sum();

// APRÈS : Logique simplifiée
double montantTotal = vente.getDetailVentes().stream()
    .mapToDouble(DetailVente::getMontantTotal)  // Toujours >= 0
    .sum();

double paiementsPositifs = vente.getPaiements().stream()
    .filter(p -> p.getMontantVerser() > 0)  // Filtre sécurisé
    .mapToDouble(Paiement::getMontantVerser)
    .sum();
```

#### **2. Recalcul Intelligent**
```java
// Méthode centralisée de recalcul
private void updateVenteMontants(Vente vente, double montantModifie) {
    // Recalcul complet basé sur les DetailVente actuels
    double nouveauMontantTotal = vente.getDetailVentes().stream()
            .mapToDouble(DetailVente::getMontantTotal)
            .sum();
    
    vente.setMontantTotal(nouveauMontantTotal);
    
    // Gestion intelligente des crédits
    if (vente.getEstCredit()) {
        double montantTotalPaye = calculerMontantTotalPaye(vente);
        vente.setMontantRestant(Math.max(0.0, nouveauMontantTotal - montantTotalPaye));
    }
    
    venteRepository.save(vente);
}
```

---

*Pour une version courte dédiée uniquement aux retours, consultez `SYSTEME_RETOURS_DOCUMENTATION_V3.md`.*
