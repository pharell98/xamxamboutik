# 📊 Guide Utilisateur - Nouveau Dashboard XamXam Boutik

## 🎯 Bienvenue dans votre nouveau tableau de bord !

Nous avons amélioré votre tableau de bord pour vous donner une **vue complète et en temps réel** de votre boutique. Ce guide vous explique toutes les nouvelles fonctionnalités.

---

## 🏠 Comment accéder au tableau de bord ?

1. Connectez-vous à votre application XamXam Boutik
2. Cliquez sur **"Tableau de bord"** dans le menu
3. Vous verrez immédiatement toutes vos statistiques du jour

---

## 📈 Qu'est-ce que vous pouvez voir maintenant ?

### **1. Contrôle de la Caisse** (En haut)

```
┌─────────────────────────────────────────────┐
│ 🏪 Caisse: [Ouverte]  [Actualiser] [Fermer]│
└─────────────────────────────────────────────┘
```

**Ce que ça signifie** :
- **Badge "Ouverte"** (vert) : Votre caisse est prête à accepter des ventes
- **Badge "Fermée"** (rouge) : La caisse est fermée, vous ne pouvez plus vendre
- **Bouton "Actualiser"** : Rafraîchit toutes les données en temps réel
- **Bouton "Fermer"** : Ferme la caisse manuellement (fin de journée)

**💡 Astuce** : Cliquez sur "Actualiser" après chaque vente pour voir vos chiffres à jour !

---

### **2. Chiffres Clés de la Journée** (Section principale)

#### **A. Carte Bénéfices** (Gauche)
```
┌──────────────────────────────────┐
│ Hello, Darou Salam Shop!         │
│                                  │
│ [Date début] [Date fin] [Filtrer]│
│                                  │
│ Chiffre d'affaires               │
│ 50,000 CFA                       │
└──────────────────────────────────┘
```

**Ce que ça signifie** :
- Affiche votre **chiffre d'affaires** (argent gagné)
- Vous pouvez **filtrer par période** avec les dates
- Cliquez sur "Filtrer" pour voir les bénéfices d'une période spécifique
- Cliquez sur ❌ pour revenir au total depuis le début

**💡 Astuce** : Utilisez les filtres pour comparer vos ventes d'une semaine à l'autre !

---

#### **B. Indicateurs Rapides** (Droite)
```
┌──────────────┬──────────────┬──────────────┐
│ Montant      │ Ventes du    │ Tickets      │
│ initial      │ jour         │ (nb ventes)  │
│ 50,000 CFA   │ 85,000 CFA   │ 45           │
├──────────────┼──────────────┼──────────────┤
│ Panier       │ Produits     │ Montant      │
│ moyen        │ vendus       │ théorique    │
│ 1,889 CFA    │ 120          │ 132,500 CFA  │
└──────────────┴──────────────┴──────────────┘
```

**Explication de chaque indicateur** :

1. **Montant initial** 💰
   - L'argent que vous aviez au début de la journée
   - Exemple : 50,000 CFA

2. **Ventes du jour** 📈
   - Tout l'argent gagné aujourd'hui
   - Exemple : 85,000 CFA

3. **Tickets (nb ventes)** 🎫
   - Combien de clients ont acheté aujourd'hui
   - Exemple : 45 clients

4. **Panier moyen** 🛒
   - Combien chaque client dépense en moyenne
   - Calcul : Ventes du jour ÷ Nombre de clients
   - Exemple : 85,000 ÷ 45 = 1,889 CFA par client

5. **Produits vendus** 📦
   - Combien d'articles ont été vendus au total
   - Exemple : 120 articles

6. **Montant théorique** 💵
   - L'argent qui devrait être dans votre caisse
   - Calcul : Montant initial + Ventes - Pertes
   - Exemple : 50,000 + 85,000 - 2,500 = 132,500 CFA
   - **Utilisez ce chiffre pour vérifier votre caisse en fin de journée !**

**💡 Astuce** : Si votre argent physique ne correspond pas au "Montant théorique", il y a peut-être une erreur à vérifier !

---

### **3. Répartition des Paiements** (Graphique rond)

```
┌─────────────────────────────────────┐
│ 💳 Répartition des paiements        │
├─────────────────────────────────────┤
│                                     │
│     [○○○○○]     ● Espèce      45%   │
│    [○ 45% ○]      50,000 CFA        │
│    [○  ●   ○]     25 ventes         │
│     [○○○○○]                         │
│                 ● Orange Money 27%  │
│                   30,000 CFA        │
│                   15 ventes         │
│                                     │
│                 ● Wave        18%   │
│                   20,000 CFA        │
│                   10 ventes         │
│                                     │
│  Total: 110,000 CFA                 │
└─────────────────────────────────────┘
```

**Ce que ça signifie** :
- Montre **comment vos clients paient**
- Chaque couleur = un mode de paiement différent
- Les pourcentages vous aident à savoir quel mode est le plus utilisé

**Modes de paiement disponibles** :
- 🔵 **Espèce** (Bleu) : Paiement en liquide
- 🟢 **Orange Money** (Vert) : Mobile money Orange
- 🟡 **Wave** (Jaune) : Mobile money Wave
- 🔷 **Carte bancaire** (Cyan) : Paiement par carte

**💡 Astuce** : Passez votre souris sur le graphique pour voir les détails de chaque mode !

---

### **4. Alertes Stock** (Carte d'avertissement)

```
┌─────────────────────────────────────┐
│ ⚠️ Alertes Stock            [13]    │
├─────────────────────────────────────┤
│                                     │
│  🔴 Rupture totale            5     │
│      Stock épuisé (0 unités)        │
│                                     │
│  🟠 Alerte critique           8     │
│      Stock très bas (≤ seuil/2)     │
│                                     │
│  [📦 Voir les produits en alerte]   │
│                                     │
│  ℹ️ Réapprovisionner rapidement     │
└─────────────────────────────────────┘
```

**Ce que ça signifie** :

**🔴 Rupture totale** :
- Ces produits n'ont **plus de stock du tout** (0 unités)
- **Action urgente** : Vous ne pouvez plus les vendre !
- Commandez-les immédiatement

**🟠 Alerte critique** :
- Ces produits ont un **stock très bas**
- **Action importante** : Commandez bientôt avant la rupture
- Vous pouvez encore vendre mais plus pour longtemps

**Badge [13]** :
- Le nombre total de produits à surveiller
- Plus le chiffre est élevé, plus vous devez agir vite

**Bouton "Voir les produits"** :
- Cliquez pour voir la liste détaillée des produits en alerte
- Vous pourrez voir exactement quels produits commander

**💡 Astuce** : Si vous voyez une icône qui clignote (⚠️), c'est qu'il y a des alertes urgentes !

---

### **5. Évolution des Ventes** (Graphique courbe)

```
┌─────────────────────────────────────────────┐
│ 📈 Évolution des ventes sur 7 jours         │
│ Total CA: 585,000 CFA  │  Moy/jour: 83,571  │
├─────────────────────────────────────────────┤
│                                             │
│  100K ┤              ╱──╲                   │
│       │            ╱      ╲                 │
│   80K ┤          ╱          ╲╱──            │
│       │        ╱                             │
│   60K ┤   ╱──╲                               │
│       └─────────────────────────────────────│
│        8   9  10  11  12  13  14 Nov        │
│                                             │
│   ─── Chiffre d'affaires (bleu)            │
│   ─── Bénéfice (vert)                      │
└─────────────────────────────────────────────┘
```

**Ce que ça signifie** :
- La **courbe bleue** : Votre chiffre d'affaires chaque jour
- La **courbe verte** : Votre bénéfice (profit) chaque jour
- **Total CA** : Somme de tous les jours
- **Moy/jour** : Moyenne par jour

**Comment lire le graphique** :
- Si la courbe **monte** 📈 : Vos ventes augmentent (bon signe !)
- Si la courbe **descend** 📉 : Vos ventes baissent (à surveiller)
- Si la courbe est **stable** ➡️ : Vos ventes sont régulières

**💡 Astuce** : Passez votre souris sur un point pour voir les détails exacts de ce jour-là !

---

## 🎯 Cas d'usage pratiques

### **Scénario 1 : Début de journée**
```
1. Vous ouvrez l'application
2. La caisse s'ouvre automatiquement à la première vente
3. Vous voyez votre "Montant initial" (argent de départ)
4. Tous les compteurs sont à 0 (normal, la journée commence)
```

### **Scénario 2 : Pendant la journée**
```
1. Après chaque vente, cliquez sur "Actualiser"
2. Vous voyez :
   - "Ventes du jour" augmenter
   - "Tickets" augmenter (nombre de clients)
   - "Produits vendus" augmenter
3. Le graphique "Répartition paiements" se met à jour
```

### **Scénario 3 : Fin de journée**
```
1. Regardez "Montant théorique" (ex: 132,500 CFA)
2. Comptez l'argent physique dans votre caisse
3. Si ça correspond → Parfait ! ✅
4. Si ça ne correspond pas → Vérifiez les ventes ⚠️
5. Cliquez sur "Fermer" pour clôturer la caisse
```

### **Scénario 4 : Alerte stock**
```
1. Vous voyez un badge rouge [13] sur "Alertes Stock"
2. Vous voyez "5 produits en rupture totale"
3. Cliquez sur "Voir les produits en alerte"
4. Commandez ces produits rapidement
```

---

## 🔍 Filtres disponibles

### **Filtre par période** (Répartition paiements et KPIs)
Vous pouvez voir vos statistiques pour différentes périodes :

- **Aujourd'hui** : Les chiffres du jour en cours
- **7 derniers jours** : La semaine passée
- **Mois en cours** : Depuis le 1er du mois
- **Année en cours** : Depuis le 1er janvier

**Comment changer la période** :
- Pour l'instant, c'est configuré sur "Aujourd'hui" par défaut
- Contactez votre administrateur pour changer la période affichée

---

## 💡 Conseils pour bien utiliser le dashboard

### **✅ À faire tous les jours**
1. **Matin** : Vérifiez que la caisse est ouverte
2. **Après-midi** : Cliquez sur "Actualiser" pour voir vos progrès
3. **Soir** : Vérifiez le "Montant théorique" avant de fermer
4. **Toujours** : Surveillez les alertes stock (badge rouge)

### **📊 Indicateurs importants à surveiller**

#### **Panier moyen** 🛒
- **Si il augmente** : Vos clients achètent plus → Bon signe ! 📈
- **Si il baisse** : Vos clients achètent moins → À surveiller 📉
- **Objectif** : Essayez d'augmenter ce chiffre avec des promotions

#### **Tickets (nombre de ventes)** 🎫
- **Si il augmente** : Plus de clients viennent → Excellent ! 👥
- **Si il baisse** : Moins de clients → Peut-être faire de la publicité
- **Objectif** : Avoir le plus de clients possible

#### **Alertes stock** ⚠️
- **0 alerte** : Tout va bien, vous êtes bien approvisionné ✅
- **1-5 alertes** : Attention, commandez bientôt 🟡
- **Plus de 10 alertes** : Urgent, risque de perdre des ventes ! 🔴
- **Objectif** : Toujours avoir du stock disponible

---

## 🎨 Comprendre les graphiques

### **Graphique en rond (Camembert)** 🥧
```
     [○○○○○]
    [○     ○]
   [○  45% ○]
    [○  ●  ○]
     [○○○○○]
```

**Ce que vous voyez** :
- Chaque **couleur** = un mode de paiement
- Chaque **portion** = le pourcentage de ce mode
- Plus la portion est **grande**, plus ce mode est utilisé

**Exemple** :
- Si le bleu (Espèce) prend 45% du cercle
- Ça veut dire que 45% de vos clients paient en espèce
- Les 55% restants utilisent Orange Money, Wave ou Carte

**💡 Pourquoi c'est utile ?**
- Vous savez quels modes de paiement proposer en priorité
- Vous pouvez prévoir combien d'argent liquide garder
- Vous voyez si les paiements mobiles sont populaires

---

### **Graphique en courbe (Évolution)** 📈
```
  100K ┤            ╱──╲
       │          ╱      ╲
   80K ┤        ╱          ╲╱──
       │      ╱
   60K ┤   ╱
       └────────────────────────
        8   9  10  11  12  13  14
```

**Ce que vous voyez** :
- **Ligne bleue** : Votre chiffre d'affaires chaque jour
- **Ligne verte** : Votre bénéfice (profit) chaque jour
- **Axe horizontal** : Les dates (8, 9, 10... = jours du mois)
- **Axe vertical** : Les montants (60K = 60,000 CFA)

**Comment lire la courbe** :
- **Point haut** : Bonne journée de ventes 📈
- **Point bas** : Journée plus calme 📉
- **Ligne qui monte** : Vos ventes progressent 🚀
- **Ligne qui descend** : Vos ventes diminuent ⚠️

**💡 Pourquoi c'est utile ?**
- Vous voyez les **tendances** de votre boutique
- Vous identifiez les **meilleurs jours** de la semaine
- Vous pouvez **prévoir** les jours creux et planifier des promotions

---

## 🚨 Comprendre les alertes

### **Types d'alertes stock**

#### **🔴 Rupture totale** (Rouge - Urgent)
```
⚠️ Rupture totale
   5 produits
   Stock épuisé (0 unités)
```

**Qu'est-ce que ça veut dire ?**
- Ces 5 produits n'ont **plus aucun stock**
- Vous **ne pouvez plus les vendre**
- **Action immédiate** : Commandez ces produits aujourd'hui !

**Exemple** :
- Si "Savon Dove" est en rupture totale
- Un client demande du Savon Dove
- Vous ne pouvez pas le vendre → Vous perdez la vente 😞

---

#### **🟠 Alerte critique** (Orange - Important)
```
⚠️ Alerte critique
   8 produits
   Stock très bas (≤ seuil/2)
```

**Qu'est-ce que ça veut dire ?**
- Ces 8 produits ont un **stock très faible**
- Vous pouvez encore les vendre **mais plus pour longtemps**
- **Action dans 1-2 jours** : Commandez avant la rupture

**Exemple** :
- Si "Huile Végétale" a 3 unités en stock
- Votre seuil d'alerte est 10 unités
- 3 < 10/2 → Alerte critique !
- Commandez maintenant avant d'être en rupture

---

### **Aucune alerte** (Vert - Tout va bien) ✅
```
✅ Aucune alerte stock
   Tous les produits sont bien approvisionnés
```

**Qu'est-ce que ça veut dire ?**
- Tous vos produits ont **assez de stock**
- Vous pouvez vendre **sans problème**
- **Continuez comme ça !** 👍

---

## 📱 Bouton "Actualiser" - Quand l'utiliser ?

Cliquez sur le bouton **"Actualiser"** dans ces situations :

1. ✅ **Après une vente** : Pour voir vos nouveaux chiffres
2. ✅ **Toutes les heures** : Pour suivre votre progression
3. ✅ **Avant de fermer** : Pour avoir les chiffres finaux
4. ✅ **Si les chiffres semblent incorrects** : Pour forcer la mise à jour

**⏱️ Temps de rafraîchissement** : ~1 seconde

---

## 🎯 Questions fréquentes (FAQ)

### **Q1 : Pourquoi "Montant théorique" ne correspond pas à mon argent physique ?**
**R** : Plusieurs raisons possibles :
- Vous avez fait une erreur de rendu de monnaie
- Un paiement n'a pas été enregistré correctement
- Il y a eu un retrait/dépôt non enregistré
- **Solution** : Vérifiez vos ventes une par une dans "Liste des ventes"

---

### **Q2 : Le graphique "Répartition paiements" est vide, pourquoi ?**
**R** : 
- Vous n'avez pas encore fait de vente aujourd'hui
- **Solution** : Faites une vente et cliquez sur "Actualiser"

---

### **Q3 : Comment savoir si j'ai fait une bonne journée ?**
**R** : Regardez ces 3 indicateurs :
1. **Ventes du jour** : Plus c'est élevé, mieux c'est
2. **Tickets** : Plus vous avez de clients, mieux c'est
3. **Graphique évolution** : Si la courbe monte, c'est bon signe !

---

### **Q4 : C'est quoi la différence entre "Ventes du jour" et "Montant théorique" ?**
**R** :
- **Ventes du jour** = Argent gagné aujourd'hui seulement
- **Montant théorique** = Argent initial + Ventes - Pertes
- **Exemple** :
  - Montant initial : 50,000 CFA (argent de départ)
  - Ventes du jour : 85,000 CFA (argent gagné)
  - Pertes : 2,500 CFA (remboursements)
  - **Montant théorique** : 50,000 + 85,000 - 2,500 = **132,500 CFA**

---

### **Q5 : Pourquoi il y a deux courbes sur le graphique d'évolution ?**
**R** :
- **Courbe bleue** (haute) : Votre chiffre d'affaires (argent total)
- **Courbe verte** (basse) : Votre bénéfice (profit après coûts)
- La différence entre les deux = vos coûts d'achat des produits

---

### **Q6 : Les alertes stock clignotent, c'est grave ?**
**R** :
- **Oui**, c'est pour attirer votre attention !
- Si ça clignote en rouge → Rupture totale (très urgent)
- Si ça clignote en orange → Alerte critique (urgent)
- **Action** : Cliquez sur "Voir les produits" et commandez

---

## 🎓 Conseils pour augmenter vos ventes

### **1. Surveillez votre panier moyen** 🛒
- Si votre panier moyen est **1,500 CFA** :
  - Proposez des **produits complémentaires**
  - Exemple : "Avec ce savon, voulez-vous aussi une éponge ?"
  - Objectif : Augmenter à **2,000 CFA** ou plus

### **2. Analysez les modes de paiement** 💳
- Si **80% paient en espèce** :
  - Gardez assez de monnaie pour rendre
  - Proposez aussi Orange Money/Wave pour faciliter
- Si **50% paient en mobile money** :
  - Affichez bien vos options de paiement
  - Vérifiez que vos comptes fonctionnent

### **3. Évitez les ruptures de stock** 📦
- Commandez **avant** d'arriver à 0
- Regardez le graphique d'évolution :
  - Si vos ventes augmentent → Commandez plus de stock
  - Si vos ventes baissent → Commandez moins

### **4. Identifiez vos meilleurs jours** 📅
- Regardez le graphique d'évolution
- Notez quels jours vous vendez le plus
- **Exemple** : Si le samedi est toujours haut
  - Prévoyez plus de stock le samedi
  - Ayez plus de personnel disponible

---

## 🆘 Besoin d'aide ?

### **Le dashboard ne charge pas ?**
1. Vérifiez votre connexion internet
2. Actualisez la page (F5 ou Ctrl+R)
3. Déconnectez-vous et reconnectez-vous
4. Contactez votre administrateur

### **Les chiffres semblent incorrects ?**
1. Cliquez sur "Actualiser" pour forcer la mise à jour
2. Vérifiez dans "Liste des ventes" si toutes les ventes sont là
3. Vérifiez qu'aucune vente n'a été annulée par erreur
4. Contactez votre administrateur si le problème persiste

### **Un graphique est vide ?**
- C'est normal si vous n'avez pas encore de données
- Faites quelques ventes et actualisez
- Les graphiques se rempliront automatiquement

---

## 🎉 Résumé des nouveautés

### **Ce qui a été ajouté** :

✨ **3 nouveaux indicateurs** :
- Tickets (nombre de ventes)
- Panier moyen
- Produits vendus

✨ **2 nouveaux graphiques** :
- Répartition des paiements (camembert)
- Évolution des ventes sur 7 jours (courbe)

✨ **1 nouveau widget** :
- Alertes stock avec compteurs animés

✨ **1 nouveau filtre** :
- Filtrer les ventes par mode de paiement (dans Liste des ventes)

---

## 📞 Support

Pour toute question ou problème :
- 📧 Email : support@xamxamboutik.sn
- 📱 Téléphone : +221 XX XXX XX XX
- 💬 WhatsApp : +221 XX XXX XX XX

---

## 🎓 Formation

**Durée recommandée** : 15 minutes pour maîtriser le dashboard

**Ce que vous allez apprendre** :
1. Lire les 6 indicateurs principaux (5 min)
2. Comprendre les graphiques (5 min)
3. Gérer les alertes stock (5 min)

**Conseil** : Utilisez le dashboard pendant 1 semaine, vous allez vite comprendre les tendances de votre boutique !

---

## ✅ Checklist quotidienne

Imprimez et suivez cette checklist chaque jour :

```
☐ Matin (9h)
  ☐ Vérifier que la caisse est ouverte
  ☐ Noter le "Montant initial"
  ☐ Vérifier les alertes stock

☐ Midi (12h)
  ☐ Cliquer sur "Actualiser"
  ☐ Vérifier les ventes de la matinée
  ☐ Commander les produits en rupture si nécessaire

☐ Après-midi (16h)
  ☐ Cliquer sur "Actualiser"
  ☐ Vérifier le panier moyen
  ☐ Encourager les ventes complémentaires

☐ Soir (19h - Fermeture)
  ☐ Cliquer sur "Actualiser" une dernière fois
  ☐ Noter le "Montant théorique"
  ☐ Compter l'argent physique
  ☐ Vérifier que ça correspond
  ☐ Cliquer sur "Fermer" pour clôturer la caisse
  ☐ Regarder le graphique d'évolution pour voir la tendance
```

---

## 🌟 Félicitations !

Vous avez maintenant un **tableau de bord professionnel** qui vous aide à :
- ✅ Suivre vos ventes en temps réel
- ✅ Comprendre comment vos clients paient
- ✅ Éviter les ruptures de stock
- ✅ Voir l'évolution de votre boutique
- ✅ Prendre de meilleures décisions

**Bonne gestion de votre boutique !** 🎉🏪

---

*Document créé le 14 novembre 2025*  
*Version 1.0 - XamXam Boutik Dashboard*

