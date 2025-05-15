import * as yup from 'yup';

// Autorise data:image/... ou http(s)://...
const dataOrHttpRegex =
  /^(?:data:image\/(?:png|jpe?g);base64,[A-Za-z0-9+/=]+|https?:\/\/[^\s]+)$/i;

/**
 * Schéma de validation pour le formulaire basique (ProductForm).
 * On utilise désormais :
 *   - libelle, prixAchat, stockDisponible
 */
export const productSchema = yup.object().shape({
  libelle: yup
    .string()
    .trim()
    .required('Le libellé du produit est obligatoire'),
  prixAchat: yup
    .number()
    .typeError("Le prix d'achat doit être un nombre")
    .min(0, "Le prix d'achat ne peut pas être négatif")
    .required("Le prix d'achat est obligatoire"),
  stockDisponible: yup
    .number()
    .typeError('La quantité (stock) doit être un nombre')
    .positive('La quantité doit être supérieure à 0')
    .required('La quantité est obligatoire')
});

/**
 * Schéma de validation pour les informations complémentaires (NewProductDetails).
 * On utilise désormais :
 *   - categorieId, prixVente, seuilRuptureStock, image (optionnel)
 *   - manualCode et codeProduit pour la gestion du code
 *   - useImageURL et imageURL pour la gestion de l'image
 */
export const newProductSchema = yup.object().shape({
  categorieId: yup.string().required('La catégorie est obligatoire'),
  prixVente: yup
    .number()
    .typeError('Le prix de vente doit être un nombre')
    .positive('Le prix de vente doit être supérieur à 0')
    .required('Le prix de vente est obligatoire'),
  seuilRuptureStock: yup
    .number()
    .typeError('Le seuil de rupture doit être un nombre')
    .min(0, 'Le seuil de rupture ne peut pas être négatif')
    .required('Le seuil de rupture est obligatoire'),
  manualCode: yup.boolean(),
  codeProduit: yup.string().when('manualCode', {
    is: true,
    then: schema =>
      schema
        .matches(
          /^\d+$/,
          'Le code produit doit être uniquement composé de chiffres.'
        )
        .required('Le code produit est obligatoire.'),
    otherwise: schema => schema.notRequired() // En mode auto, le code sera généré
  }),
  useImageURL: yup.boolean(),
  imageURL: yup.string().when('useImageURL', {
    is: true,
    then: schema =>
      schema
        .matches(
          dataOrHttpRegex,
          'Veuillez entrer une URL valide ou un data URL d’image au format base64.'
        )
        .notRequired(),
    otherwise: schema => schema.notRequired()
  }),
  image: yup.mixed().nullable()
});
