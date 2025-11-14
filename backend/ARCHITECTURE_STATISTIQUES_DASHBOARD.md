# 📊 Architecture Statistiques & Dashboard - Documentation

## 🎯 Objectif
Fournir des KPIs et statistiques pour le dashboard sans duplication de code, en réutilisant les services existants.

---

## 🏗️ Architecture en couches

```
┌─────────────────────────────────────────────────────┐
│                    Controllers                       │
│  StatistiqueController + CaisseController            │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│                  Services API                        │
│  StatistiqueApiService + CaisseApiService            │
│  (Formatage réponse, validation)                    │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│              Services Métier                         │
│  StatistiqueBusinessService                          │
│  DashboardStatistiqueService                         │
│  CaisseInternalService                               │
│  (Logique métier pure, calculs)                     │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│              Repositories                            │
│  VenteRepository, ProduitRepository, etc.            │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Services et responsabilités

### **StatistiqueBusinessService** (Logique métier de base)
**Responsabilité** : Calculs statistiques fondamentaux
**Méthodes** :
- `getCumulativeBenefit()` - Bénéfice total
- `getBenefitBetweenDates()` - Bénéfice sur période
- `getCumulativeRevenue()` - CA total
- `getRevenueBetweenDates()` - CA sur période
- `getTotalSalesCount()` - Nombre total ventes
- `getTotalProductsSold()` - Produits vendus total
- ✨ `getSalesCountBetweenDates()` - Ventes sur période (NOUVEAU)
- ✨ `getProductsSoldBetweenDates()` - Produits vendus sur période (NOUVEAU)

### **DashboardStatistiqueService** (Logique métier avancée)
**Responsabilité** : Calculs spécifiques au dashboard
**Méthodes** :
- `getVentesByPaymentMode()` - Répartition par mode paiement
- `getAverageBasket()` - Calcul panier moyen
- `getSalesEvolution()` - Évolution jour par jour
- `countProduitsEnRupture()` - Compteur produits rupture
- `countProduitsAlerteCritique()` - Compteur alertes critiques
- `getTauxRetour()` - Taux retours/échanges

### **CaisseInternalService** (Logique caisse)
**Responsabilité** : Gestion caisse (ouverture/fermeture)
**Pas de modification** : Réutilisé tel quel

---

## 🌐 Endpoints REST disponibles

### **Endpoints existants (réutilisés)**
```http
GET  /caisse/etat
     → Retourne : montantInitial, ventesDuJour, pertesDuJour, 
                  montantFermeture, montantTotalCaisseReel, status

GET  /stock/rupture?page=1&size=10
     → Retourne : Liste produits en rupture avec détails

GET  /ventes/produits?page=1&size=5
     → Retourne : Top produits triés par ventes
```

### **Nouveaux endpoints (optimisés)**
```http
GET  /statistiques/ventes/kpis-complementaires?period=today
     → Retourne : panierMoyen, nombreVentes, produitsVendus,
                  produitsEnRupture, produitsAlerteCritique
     → Évite duplication avec /caisse/etat

GET  /statistiques/ventes/by-payment-mode?period=today
     → Retourne : [{modePaiement, montant, pourcentage, nombreVentes}, ...]
     → Pour graphique camembert

GET  /statistiques/ventes/evolution-ca?days=7
     → Retourne : [{date, chiffreAffaires, benefice, nombreVentes}, ...]
     → Pour graphique courbe évolution
```

---

## 🔄 Stratégie d'appels Frontend

### **Dashboard E-commerce - Chargement initial**
Le frontend doit faire **4 appels en parallèle** :

```javascript
const loadDashboard = async () => {
  const [caisse, kpis, paiements, evolution] = await Promise.all([
    caisseService.getEtat(),                           // 1. État caisse
    dashboardService.getKpisComplementaires('today'),  // 2. KPIs jour
    dashboardService.getPaymentModeBreakdown('today'), // 3. Répartition
    dashboardService.getSalesEvolution(7)              // 4. Évolution 7j
  ]);
  
  // Optionnel : alertes stock détaillées
  const stockAlerts = await api.getLowStockProducts(10);
};
```

### **Mapping des données**

#### **1. EcomStat (KPIs principaux)**
```javascript
{
  CA du jour:         caisse.ventesDuJour
  Nombre de ventes:   kpis.nombreVentes
  Panier moyen:       kpis.panierMoyen
  Produits vendus:    kpis.produitsVendus
  Alertes stock:      kpis.produitsEnRupture + kpis.produitsAlerteCritique
}
```

#### **2. PaymentModeChart (Camembert)**
```javascript
paiements.map(p => ({
  name: p.modePaiement,
  value: p.montant,
  percentage: p.pourcentage
}))
```

#### **3. SalesEvolutionChart (Courbe)**
```javascript
evolution.map(e => ({
  date: e.date,
  ca: e.chiffreAffaires,
  benefice: e.benefice
}))
```

---

## ✅ Avantages de cette architecture

1. **Pas de duplication** : `/caisse/etat` fournit le CA, pas besoin de le recalculer
2. **Services ciblés** : Chaque endpoint a une responsabilité claire
3. **Performance** : 4 appels parallèles au lieu de 10+ appels séquentiels
4. **Évolutif** : Facile d'ajouter de nouveaux KPIs sans casser l'existant
5. **Maintenable** : Séparation claire entre logique métier et exposition API
6. **Testable** : Chaque service peut être testé indépendamment

---

## 📈 KPIs disponibles par endpoint

| KPI | Endpoint source | Champ |
|-----|----------------|-------|
| CA du jour | `/caisse/etat` | `ventesDuJour` |
| Pertes du jour | `/caisse/etat` | `pertesDuJour` |
| Montant caisse | `/caisse/etat` | `montantTotalCaisseReel` |
| Nombre ventes | `/statistiques/ventes/kpis-complementaires` | `nombreVentes` |
| Panier moyen | `/statistiques/ventes/kpis-complementaires` | `panierMoyen` |
| Produits vendus | `/statistiques/ventes/kpis-complementaires` | `produitsVendus` |
| Alertes stock | `/statistiques/ventes/kpis-complementaires` | `produitsEnRupture`, `produitsAlerteCritique` |
| Répartition paiements | `/statistiques/ventes/by-payment-mode` | Liste complète |
| Évolution CA | `/statistiques/ventes/evolution-ca` | Liste 7 jours |
| Top produits | `/ventes/produits` | Déjà existant |
| Détails stock | `/stock/rupture` | Déjà existant |

---

## 🚀 Performance et optimisation

### **Requêtes SQL optimisées**
- Tous les calculs utilisent `COALESCE` pour gérer les NULL
- Les jointures sont minimales et ciblées
- Les filtres (deleted=false, status) sont bien indexés

### **Cache potentiel** (à implémenter si besoin)
- Les KPIs du jour peuvent être cachés 1-2 minutes
- L'évolution 7 jours peut être cachée 10 minutes
- Les alertes stock peuvent être cachées 5 minutes

---

## 📝 DTOs créés

| DTO | Usage | Champs principaux |
|-----|-------|------------------|
| `KpisComplementairesDTO` | Endpoint `/kpis-complementaires` | panierMoyen, nombreVentes, produitsVendus, alertes |
| `PaymentModeStatDTO` | Endpoint `/by-payment-mode` | modePaiement, montant, pourcentage, nombreVentes |
| `SalesEvolutionDTO` | Endpoint `/evolution-ca` | date, chiffreAffaires, benefice, nombreVentes |
| `AverageBasketDTO` | Usage interne seulement | Calcul intermédiaire |

---

## 🔧 Maintenance future

### **Pour ajouter un nouveau KPI** :
1. Ajouter méthode de calcul dans `DashboardStatistiqueService`
2. L'exposer via `StatistiqueApiService`
3. Créer endpoint dans `StatistiqueController`
4. Consommer dans le frontend

### **Pour optimiser les performances** :
1. Ajouter cache Spring (`@Cacheable`) sur méthodes lourdes
2. Créer des vues matérialisées pour statistiques historiques
3. Implémenter des index sur colonnes filtrées (date, status, modePaiement)

---

## ⚠️ Points d'attention

1. **Pas de duplication entre `/caisse/etat` et `/statistiques/...`**
   - `/caisse/etat` → Montants caisse (initial, ventes jour, pertes, fermeture)
   - `/statistiques/...` → KPIs complémentaires (panier, tickets, alertes, répartition)

2. **Période par défaut** : `today` pour tous les endpoints avec paramètre `period`

3. **Formats de retour** :
   - Montants en Double (CFA)
   - Compteurs en Long
   - Pourcentages arrondis à 2 décimales

4. **Gestion erreurs** : Tous les services lèvent RuntimeException avec message explicite

---

## 🧪 Tests à effectuer

1. Appeler `/statistiques/ventes/kpis-complementaires?period=today`
2. Appeler `/statistiques/ventes/by-payment-mode?period=today`
3. Appeler `/statistiques/ventes/evolution-ca?days=7`
4. Vérifier cohérence avec `/caisse/etat`
5. Tester avec différentes périodes (7days, month, year)
6. Tester cas sans données (retour 0 ou liste vide)

---

## 📚 Références

- Code source : `/backend/src/main/java/sn/boutique/xamxamboutik/Service/statistique/`
- DTOs : `/backend/src/main/java/sn/boutique/xamxamboutik/Web/DTO/Response/web/`
- Controllers : `/backend/src/main/java/sn/boutique/xamxamboutik/Web/Controller/statistique/`

