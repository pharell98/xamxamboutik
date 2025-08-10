// Test script pour vérifier la validation des codes-barres
// À supprimer après les tests

const isValidBarcode = (code) => {
  // Accepter différents formats de codes-barres standards
  const trimmedCode = code.trim();
  
  // EAN-13 (13 chiffres), UPC-A (12 chiffres), EAN-8 (8 chiffres)
  // Codes-barres longs (jusqu'à 30 chiffres pour certains systèmes)
  const isStandardBarcode = /^\d{8}$|^\d{12}$|^\d{13}$/.test(trimmedCode);
  const isLongBarcode = /^\d{14,30}$/.test(trimmedCode);
  
  const isValid = isStandardBarcode || isLongBarcode;
  
  console.log('[Test] Validation code-barres:', {
    code: trimmedCode,
    length: trimmedCode.length,
    isStandardBarcode,
    isLongBarcode,
    isValid
  });
  
  return isValid;
};

// Tests
console.log('=== Tests de validation des codes-barres ===');

// Test avec le code-barres problématique
const problematicBarcode = '88771177116633000044886699';
console.log('\n1. Test avec le code-barres problématique:');
isValidBarcode(problematicBarcode);

// Test avec des codes-barres standards
console.log('\n2. Tests avec des codes-barres standards:');
isValidBarcode('1234567890123'); // EAN-13
isValidBarcode('123456789012');  // UPC-A
isValidBarcode('12345678');      // EAN-8

// Tests avec des codes invalides
console.log('\n3. Tests avec des codes invalides:');
isValidBarcode('123');           // Trop court
isValidBarcode('1234567890123456789012345678901'); // Trop long (31 chiffres)
isValidBarcode('12345678901A');  // Contient des lettres

console.log('\n=== Fin des tests ===');
