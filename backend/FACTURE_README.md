# Génération Automatique des Numéros de Facture

## Vue d'ensemble

Le système génère automatiquement un numéro de facture unique pour chaque vente au format : **FAC-JJ-MM-AA-0001**

## Format du Numéro de Facture

```
FAC-JJ-MM-AA-0001
│   │  │  │  │
│   │  │  │  └── Numéro de séquence (0001 à 9999)
│   │  │  └───── Année (2 derniers chiffres)
│   │  └──────── Mois (01 à 12)
│   └─────────── Jour (01 à 31)
└─────────────── Préfixe fixe "FAC"
```

### Exemples
- `FAC-15-12-24-0001` : 15 décembre 2024, facture #0001
- `FAC-15-12-24-0002` : 15 décembre 2024, facture #0002
- `FAC-01-01-25-0001` : 1er janvier 2025, facture #0001

## Fonctionnement

### 1. Génération Automatique
- Chaque fois qu'une nouvelle vente est créée, un numéro de facture est généré automatiquement
- Le système vérifie le dernier numéro de facture du jour et incrémente la séquence
- La séquence recommence à 1 chaque jour

### 2. Logique de Séquence
- **Première facture du jour** : Séquence = 0001
- **Deuxième facture du jour** : Séquence = 0002
- **Et ainsi de suite...**
- **Maximum** : 9999 factures par jour

### 3. Gestion des Changements de Date
- **Nouveau jour** : La séquence recommence à 0001
- **Nouveau mois** : La séquence recommence à 0001
- **Nouvelle année** : La séquence recommence à 0001

## Implémentation Technique

### Entité Vente
```java
@Column(name = "numero_facture", unique = true)
private String numeroFacture;
```

### Repository
```java
@Query("SELECT v.numeroFacture FROM Vente v WHERE v.numeroFacture LIKE :prefix% ORDER BY v.numeroFacture DESC LIMIT 1")
Optional<String> findLastNumeroFactureByPrefix(@Param("prefix") String prefix);
```

### Service
```java
private String generateNumeroFacture() {
    LocalDateTime now = LocalDateTime.now();
    String jour = String.format("%02d", now.getDayOfMonth());
    String mois = String.format("%02d", now.getMonthValue());
    String annee = String.format("%02d", now.getYear() % 100);
    
    String prefix = "FAC-" + jour + "-" + mois + "-" + annee + "-";
    
    // Récupérer le dernier numéro de facture du jour
    Optional<String> lastNumero = venteRepository.findLastNumeroFactureByPrefix(prefix);
    
    int sequence = 1;
    if (lastNumero.isPresent()) {
        String lastNum = lastNumero.get();
        String sequenceStr = lastNum.substring(lastNum.lastIndexOf("-") + 1);
        sequence = Integer.parseInt(sequenceStr) + 1;
    }
    
    return prefix + String.format("%04d", sequence);
}
```

## Utilitaire NumeroFactureGenerator

### Méthodes Disponibles

#### 1. Génération
- `generateNumeroFacture(LocalDateTime date, int sequence)` : Génère avec date spécifique
- `generateNumeroFacture(int sequence)` : Génère pour la date actuelle

#### 2. Extraction
- `extractDateFromNumero(String numeroFacture)` : Extrait la date
- `extractSequenceFromNumero(String numeroFacture)` : Extrait la séquence

#### 3. Validation
- `isValidFormat(String numeroFacture)` : Vérifie le format

### Exemple d'Utilisation
```java
// Générer un numéro de facture
String numero = NumeroFactureGenerator.generateNumeroFacture(1);

// Extraire la date
LocalDateTime date = NumeroFactureGenerator.extractDateFromNumero(numero);

// Valider le format
boolean isValid = NumeroFactureGenerator.isValidFormat(numero);
```

## Tests

Des tests unitaires sont disponibles dans `NumeroFactureGeneratorTest.java` pour valider :
- La génération correcte des numéros
- L'extraction des informations
- La validation des formats
- Les cas limites (changement de date, séquences multiples)

## Avantages

1. **Unicité** : Chaque facture a un numéro unique
2. **Traçabilité** : Le numéro contient la date de création
3. **Séquentialité** : Ordre chronologique des factures
4. **Lisibilité** : Format facile à lire et comprendre
5. **Automatisation** : Aucune intervention manuelle requise

## Limitations

1. **Maximum 9999 factures par jour** (suffisant pour la plupart des cas d'usage)
2. **Format fixe** : Le format ne peut pas être modifié sans changer le code
3. **Dépendance à la date système** : La date de création détermine le numéro

## Maintenance

### Ajout de Nouveaux Formats
Pour ajouter un nouveau format de numérotation, modifier :
1. La méthode `generateNumeroFacture()` dans `VenteService`
2. La méthode `findLastNumeroFactureByPrefix()` dans `VenteRepository`
3. L'utilitaire `NumeroFactureGenerator` si nécessaire

### Migration des Données Existantes
Si des ventes existent sans numéro de facture, exécuter une requête SQL pour les mettre à jour :
```sql
UPDATE ventes 
SET numero_facture = CONCAT('FAC-', 
                           LPAD(DAY(date), 2, '0'), '-',
                           LPAD(MONTH(date), 2, '0'), '-',
                           LPAD(YEAR(date) % 100, 2, '0'), '-',
                           LPAD(id, 4, '0'))
WHERE numero_facture IS NULL;
```
