// basicInformationSchema.js

import * as yup from 'yup';

// Autorise data:image/... ou http(s)://...
const dataOrHttpRegex =
  /^(?:data:image\/(?:png|jpe?g);base64,[A-Za-z0-9+/=]+|https?:\/\/[^\s]+)$/i;

export const basicInformationSchema = yup.object({
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
    otherwise: schema => schema.required('Le code produit est obligatoire.')
  }),
  libelle: yup.string().required('Le libellé est obligatoire.'),
  prixAchat: yup
    .number()
    .transform(value => (Number.isNaN(value) ? null : value))
    .nullable()
    .required('Le prix d’achat est obligatoire.')
    .min(0, 'Le prix d’achat doit être positif.'),
  prixVente: yup
    .number()
    .transform(value => (Number.isNaN(value) ? null : value))
    .nullable()
    .required('Le prix de vente est obligatoire.')
    .min(0, 'Le prix de vente doit être positif.'),
  stockDisponible: yup
    .number()
    .transform(value => (Number.isNaN(value) ? null : value))
    .nullable()
    .required('Le stock disponible est obligatoire.')
    .min(0, 'Le stock disponible doit être positif.'),
  seuilRuptureStock: yup
    .number()
    .transform(value => (Number.isNaN(value) ? null : value))
    .nullable()
    .required('Le seuil de rupture de stock est obligatoire.')
    .min(0, 'Le seuil de rupture de stock doit être positif.'),
  categorieProduit: yup
    .string()
    .required('La catégorie du produit est obligatoire.'),

  useImageURL: yup.boolean(),

  imageURL: yup
    .string()
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
          // on valide le format si rempli, mais sans rendre obligatoire
          .matches(
            dataOrHttpRegex,
            'Veuillez entrer une URL valide ou un data URL d’image au format base64.'
          )
          .notRequired(),
      otherwise: schema => schema.notRequired()
    })
});
