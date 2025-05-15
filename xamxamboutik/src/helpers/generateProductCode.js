// helpers/generateProductCode.js

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

/**
 * Génère un code produit du format :
 * 3 lettres de la catégorie - 4 lettres du nom du produit - 6 caractères aléatoires
 */
export const generateProductCode = ({ productName, productCategory }) => {
  if (!productName || !productCategory) {
    throw new Error(
      'Le nom du produit et la catégorie sont obligatoires pour générer un code.'
    );
  }

  // Convertir productCategory en chaîne avant d'utiliser slice()
  const catPart = String(productCategory).slice(0, 3).toUpperCase();

  // 4 premières lettres du nom (en majuscules)
  const namePart = productName.slice(0, 4).toUpperCase();

  // 6 caractères aléatoires
  const randomPart = generateRandomString(6);

  return `${catPart}-${namePart}-${randomPart}`;
};
