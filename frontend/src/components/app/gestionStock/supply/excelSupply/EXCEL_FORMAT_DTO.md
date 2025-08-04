# Nouveau Format DTO pour l'Import Excel d'Approvisionnement

## Headers Excel Attendus

Le fichier Excel doit contenir les colonnes suivantes (dans l'ordre) :

1. **code produit** - Code du produit (optionnel, sera généré automatiquement si vide)
2. **libelle** - Nom/description du produit (obligatoire)
3. **prix achat** - Prix d'achat du produit (obligatoire)
4. **prix vente** - Prix de vente du produit (obligatoire)
5. **stock disponible** - Quantité en stock (obligatoire)
6. **seuil rupture stock** - Seuil d'alerte de rupture de stock (obligatoire)
7. **categorie produit** - Catégorie du produit (obligatoire)
8. **image url** - URL de l'image du produit (optionnel)

## Format DTO Backend - ApprovisionnementExcelRequestDTO

Le backend utilise maintenant un DTO spécifique `ApprovisionnementExcelRequestDTO` pour l'import Excel d'approvisionnement.

### Structure du DTO

```json
{
  "codeProduit": "string",
  "libelle": "string",
  "prixAchat": "number (float)",
  "prixVente": "number (float)",
  "stockDisponible": "number (integer)",
  "seuilRuptureStock": "number (integer)",
  "categorieProduit": "string",
  "imageURL": "string",
  "categorieName": "string",
  "categorieId": "number (integer)",
  "useImageURL": "boolean",
  "id": "number|null"
}
```

## Mapping Frontend → Backend

Le frontend mappe automatiquement les headers français vers les noms de propriétés du backend :

- `code produit` → `codeProduit`
- `libelle` → `libelle`
- `prix achat` → `prixAchat`
- `prix vente` → `prixVente`
- `stock disponible` → `stockDisponible`
- `seuil rupture stock` → `seuilRuptureStock`
- `categorie produit` → `categorieProduit`
- `image url` → `imageURL`

## Endpoint API

**POST** `/api/v1/approvisionnements/import/excel`

## Exemple de Données

```json
[
  {
    "codeProduit": "STYLE-LEGEND-001",
    "libelle": "style legend",
    "prixAchat": 0.0,
    "prixVente": 10.0,
    "stockDisponible": 10,
    "seuilRuptureStock": 0,
    "categorieProduit": "style",
    "imageURL": "https://example.com/image.jpg",
    "categorieName": "style",
    "categorieId": 0,
    "useImageURL": true,
    "id": null
  }
]
```

## Génération Automatique des Codes

Si le champ "code produit" est vide, le système générera automatiquement un code basé sur :
- Le nom du produit (libelle)
- La catégorie du produit

**Format de génération :** `CATEGORIE-LIBELLE-001`

**Exemples :**
- "style legend" + "style" → "STYLE-STYLE-LEGEND-001"
- "Dove concombre" + "deo dove" → "DEO-DOVE-DOVE-CONCOMBRE-001"

## Validation

- **Champs obligatoires :** `libelle`, `prixAchat`, `prixVente`, `stockDisponible`, `seuilRuptureStock`, `categorieProduit`
- **Valeurs numériques :** Converties automatiquement (prix en float, stock en integer)
- **URLs d'images :** Validées et optionnelles
- **Codes produits :** Générés automatiquement si non fournis

## Architecture

1. **ApprovisionnementExcelRequestDTO** : DTO spécifique pour l'import Excel
2. **ApprovisionnementExcelMapper** : Mapper pour convertir vers ProduitRequestDTO
3. **ExcelApproImportService** : Service modifié pour utiliser le nouveau DTO
4. **ProduitController** : Endpoint mis à jour pour accepter le nouveau format

## Avantages

- **Séparation claire** entre les DTOs d'import Excel et les DTOs standards
- **Mapping automatique** des headers français vers les propriétés backend
- **Génération automatique** des codes produits
- **Validation robuste** avec messages d'erreur clairs
- **Compatibilité** avec le système existant 