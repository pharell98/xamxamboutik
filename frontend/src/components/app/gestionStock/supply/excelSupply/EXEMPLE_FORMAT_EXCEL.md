# Exemple de Format Excel pour l'Import d'Approvisionnement

## Structure du Fichier Excel

Le fichier Excel doit avoir exactement les colonnes suivantes dans cet ordre :

| code produit | libelle | prix achat | prix vente | stock disponible | seuil rupture stock | categorie produit | image url |
|--------------|---------|------------|------------|------------------|-------------------|-------------------|-----------|
|              | style legend | 0 | 10 | 10 | 0 | style | https://example.com/style-legend.jpg |
|              | style glamour | 0 | 10 | 10 | 0 | style | https://example.com/style-glamour.jpg |
|              | style black | 0 | 10 | 10 | 0 | style | https://example.com/style-black.jpg |
|              | Dove concombre | 0 | 10 | 10 | 0 | deo dove | https://example.com/dove-concombre.jpg |
|              | dove original | 0 | 10 | 10 | 0 | deo dove | https://example.com/dove-original.jpg |
|              | Nivea Fresh Naturel | 0 | 10 | 10 | 0 | nivea men | https://example.com/nivea-fresh.jpg |

## Notes Importantes

1. **code produit** : Peut être laissé vide, sera généré automatiquement
2. **libelle** : Nom du produit (obligatoire)
3. **prix achat** : Prix d'achat (obligatoire, numérique)
4. **prix vente** : Prix de vente (obligatoire, numérique)
5. **stock disponible** : Quantité en stock (obligatoire, numérique)
6. **seuil rupture stock** : Seuil d'alerte (obligatoire, numérique)
7. **categorie produit** : Catégorie (obligatoire)
8. **image url** : URL de l'image (optionnel)

## Règles de Validation

- Les colonnes doivent être exactement dans cet ordre
- Les noms des colonnes doivent être exacts (avec espaces)
- Les valeurs numériques doivent être des nombres valides
- Les URLs d'images sont optionnelles mais doivent être valides si fournies
- Les codes produits vides seront générés automatiquement

## Génération Automatique des Codes

Si le champ "code produit" est vide, le système générera automatiquement un code basé sur :
- Le nom du produit (libelle)
- La catégorie du produit

**Format de génération :** `CATEGORIE-LIBELLE-001`

**Exemples de codes générés :**
- "style legend" + "style" → "STYLE-STYLE-LEGEND-001"
- "style glamour" + "style" → "STYLE-STYLE-GLAMOUR-001"
- "Dove concombre" + "deo dove" → "DEO-DOVE-DOVE-CONCOMBRE-001"
- "dove original" + "deo dove" → "DEO-DOVE-DOVE-ORIGINAL-001"
- "Nivea Fresh Naturel" + "nivea men" → "NIVEA-MEN-NIVEA-FRESH-NATUREL-001"

## Endpoint API

**POST** `/api/v1/approvisionnements/import/excel`

## Format de Réponse Attendu

```json
{
  "erreurs": [],
  "produitsEnregistres": [
    {
      "id": 1,
      "codeProduit": "STYLE-STYLE-LEGEND-001",
      "libelle": "style legend",
      "prixAchat": 0.0,
      "prixVente": 10.0,
      "stockDisponible": 10,
      "seuilRuptureStock": 0,
      "categorieProduit": "style"
    }
  ]
}
``` 