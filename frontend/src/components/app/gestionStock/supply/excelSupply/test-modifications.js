// Test des modifications Excel pour l'import d'approvisionnement

// Données d'exemple avec modifications
const originalData = [
  [
    'code produit',
    'libelle',
    'prix achat',
    'prix vente',
    'stock disponible',
    'seuil rupture stock',
    'categorie produit',
    'image url'
  ],
  [
    '',
    'style legend',
    '0',
    '10',
    '10',
    '0',
    'style',
    'https://example.com/style-legend.jpg'
  ],
  [
    '',
    'style glamour',
    '0',
    '10',
    '10',
    '0',
    'style',
    'https://example.com/style-glamour.jpg'
  ]
];

// Données modifiées (simulation d'édition)
const modifiedData = [
  [
    'code produit',
    'libelle',
    'prix achat',
    'prix vente',
    'stock disponible',
    'seuil rupture stock',
    'categorie produit',
    'image url'
  ],
  [
    'STYLE-LEGEND-001', // Code généré
    'style legend modifié', // Libellé modifié
    '5', // Prix achat modifié
    '15', // Prix vente modifié
    '20', // Stock modifié
    '5', // Seuil modifié
    'style premium', // Catégorie modifiée
    'https://example.com/style-legend-new.jpg' // URL modifiée
  ],
  [
    'STYLE-GLAMOUR-001', // Code généré
    'style glamour premium', // Libellé modifié
    '8', // Prix achat modifié
    '18', // Prix vente modifié
    '25', // Stock modifié
    '8', // Seuil modifié
    'style premium', // Catégorie modifiée
    'https://example.com/style-glamour-new.jpg' // URL modifiée
  ]
];

// Test de comparaison des données
const compareData = (original, modified) => {
  console.log('=== Test des modifications Excel ===');
  
  console.log('Données originales:');
  original.forEach((row, index) => {
    if (index === 0) {
      console.log('Headers:', row);
    } else {
      console.log(`Ligne ${index}:`, row);
    }
  });
  
  console.log('\nDonnées modifiées:');
  modified.forEach((row, index) => {
    if (index === 0) {
      console.log('Headers:', row);
    } else {
      console.log(`Ligne ${index}:`, row);
    }
  });
  
  // Identifier les modifications
  console.log('\nModifications détectées:');
  for (let i = 1; i < Math.min(original.length, modified.length); i++) {
    const originalRow = original[i];
    const modifiedRow = modified[i];
    
    console.log(`\nLigne ${i}:`);
    for (let j = 0; j < Math.min(originalRow.length, modifiedRow.length); j++) {
      if (originalRow[j] !== modifiedRow[j]) {
        console.log(`  Colonne ${j}: "${originalRow[j]}" → "${modifiedRow[j]}"`);
      }
    }
  }
};

// Test de formatage des données modifiées
const formatModifiedData = (modifiedData) => {
  if (!modifiedData || modifiedData.length < 2) return [];

  const headers = modifiedData[0];
  const rows = modifiedData.slice(1).filter(row => 
    row.some(cell => cell !== undefined && cell !== '')
  );

  return rows.map(row => {
    const product = headers.reduce((acc, key, idx) => {
      if (row[idx] !== undefined && row[idx] !== '') {
        acc[key] = row[idx];
      }
      return acc;
    }, {});

    // Mapping vers le format backend
    const mappedProduct = {};
    const HEADER_MAPPING = {
      'code produit': 'codeProduit',
      'libelle': 'libelle',
      'prix achat': 'prixAchat',
      'prix vente': 'prixVente',
      'stock disponible': 'stockDisponible',
      'seuil rupture stock': 'seuilRuptureStock',
      'categorie produit': 'categorieProduit',
      'image url': 'imageURL'
    };

    Object.keys(product).forEach(newKey => {
      const oldKey = HEADER_MAPPING[newKey];
      if (oldKey) {
        mappedProduct[oldKey] = product[newKey];
      }
    });

    // Format adapté pour ApprovisionnementExcelRequestDTO
    mappedProduct.categorieName = String(mappedProduct.categorieProduit || '').trim();
    mappedProduct.categorieId = 0;
    mappedProduct.imageURL = mappedProduct.imageURL ? String(mappedProduct.imageURL).trim() : '';
    mappedProduct.useImageURL = !!mappedProduct.imageURL;
    mappedProduct.prixAchat = mappedProduct.prixAchat ? Number(mappedProduct.prixAchat) : 0.0;
    mappedProduct.prixVente = mappedProduct.prixVente ? Number(mappedProduct.prixVente) : 0.0;
    mappedProduct.stockDisponible = mappedProduct.stockDisponible ? Number(mappedProduct.stockDisponible) : 0;
    mappedProduct.seuilRuptureStock = mappedProduct.seuilRuptureStock ? Number(mappedProduct.seuilRuptureStock) : 0;
    mappedProduct.id = null;

    return mappedProduct;
  });
};

// Tests
console.log('=== Test des modifications Excel ===');

// Test 1: Comparaison des données
compareData(originalData, modifiedData);

// Test 2: Formatage des données modifiées
const formattedModifiedData = formatModifiedData(modifiedData);
console.log('\nDonnées modifiées formatées pour le backend:');
formattedModifiedData.forEach((product, index) => {
  console.log(`Produit ${index + 1}:`, {
    codeProduit: product.codeProduit,
    libelle: product.libelle,
    prixAchat: product.prixAchat,
    prixVente: product.prixVente,
    stockDisponible: product.stockDisponible,
    seuilRuptureStock: product.seuilRuptureStock,
    categorieProduit: product.categorieProduit,
    imageURL: product.imageURL
  });
});

export { originalData, modifiedData, compareData, formatModifiedData }; 