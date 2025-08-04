const REQUIRED_HEADERS = [
  'code produit',
  'libelle',
  'prix achat',
  'prix vente',
  'stock disponible',
  'seuil rupture stock',
  'categorie produit',
  'image url'
];

const validateHeaders = headers => {
  if (!headers || !Array.isArray(headers)) {
    return {
      isValid: false,
      missingHeaders: REQUIRED_HEADERS,
      message: 'Les en-têtes du fichier Excel sont invalides ou absents.'
    };
  }

  const missingHeaders = REQUIRED_HEADERS.filter(
    header => !headers.includes(header)
  );

  return {
    isValid: missingHeaders.length === 0,
    missingHeaders,
    message:
      missingHeaders.length > 0
        ? `Les colonnes suivantes sont manquantes : ${missingHeaders.join(
            ', '
          )}`
        : 'Tous les en-têtes requis sont présents.'
  };
};

export default validateHeaders;
