import * as Yup from 'yup';

// Regex pour valider les URLs HTTP/HTTPS ou data URLs (base64 images)
const dataOrHttpRegex =
  /^(https?:\/\/[^\s$.?#].[^\s]*|data:image\/(png|jpeg|jpg|gif);base64,[^\s]*)$/i;

// Schéma de validation pour les paramètres de la boutique
export const shopSettingsSchema = Yup.object().shape({
  shopName: Yup.string()
    .required('Le nom de la boutique est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  logo: Yup.mixed().nullable(),
  email: Yup.string()
    .email('Adresse e-mail invalide')
    .required('L’adresse e-mail est requise'),
  phone: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Numéro de téléphone invalide')
    .required('Le numéro de téléphone est requis'),
  country: Yup.string()
    .nullable()
    .min(2, 'Le pays doit contenir au moins 2 caractères')
    .transform((value, originalValue) =>
      originalValue.trim() === '' ? null : value
    ),
  region: Yup.string()
    .nullable()
    .min(2, 'La région doit contenir au moins 2 caractères')
    .transform((value, originalValue) =>
      originalValue.trim() === '' ? null : value
    ),
  department: Yup.string()
    .nullable()
    .min(2, 'Le département doit contenir au moins 2 caractères')
    .transform((value, originalValue) =>
      originalValue.trim() === '' ? null : value
    ),
  neighborhood: Yup.string()
    .nullable()
    .min(2, 'Le quartier doit contenir au moins 2 caractères')
    .transform((value, originalValue) =>
      originalValue.trim() === '' ? null : value
    ),
  street: Yup.string()
    .nullable()
    .min(2, 'La rue doit contenir au moins 2 caractères')
    .transform((value, originalValue) =>
      originalValue.trim() === '' ? null : value
    ),
  facebookUrl: Yup.string().url('URL Facebook invalide').nullable(),
  instagramUrl: Yup.string().url('URL Instagram invalide').nullable(),
  twitterUrl: Yup.string().url('URL Twitter invalide').nullable(),
  websiteUrl: Yup.string().url('URL du site web invalide').nullable()
});

// Schéma de validation pour les informations de base des produits
export const basicInformationSchema = Yup.object().shape({
  categorieProduit: Yup.string()
    .required('La catégorie est requise')
    .min(1, 'La catégorie est requise'),
  libelle: Yup.string()
    .required('Le libellé est requis')
    .min(2, 'Le libellé doit contenir au moins 2 caractères'),
  prixAchat: Yup.number()
    .required('Le prix d’achat est requis')
    .min(0, 'Le prix d’achat doit être positif'),
  prixVente: Yup.number()
    .required('Le prix de vente est requis')
    .min(0, 'Le prix de vente doit être positif'),
  stockDisponible: Yup.number()
    .required('Le stock disponible est requis')
    .min(0, 'Le stock doit être positif ou zéro'),
  seuilRuptureStock: Yup.number()
    .required('Le seuil de rupture est requis')
    .min(0, 'Le seuil doit être positif ou zéro'),
  codeProduit: Yup.string()
    .required('Le code produit est requis')
    .matches(/^\d+$/, 'Le code produit doit contenir uniquement des chiffres'),
  manualCode: Yup.boolean(),
  imageProduit: Yup.mixed().nullable(),
  useImageURL: Yup.boolean(),
  imageURL: Yup.string()
    .transform(value => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? undefined : trimmed;
      }
      return value;
    })
    .nullable()
    .when('useImageURL', {
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
  id: Yup.number().nullable()
});
