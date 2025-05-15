// src/components/app/validatore/categorySchema.js
import * as yup from 'yup';

export const categorySchema = yup.object({
  libelle: yup
    .string()
    .required('Le libellé de la catégorie est obligatoire.')
    .min(3, 'Le libellé de la catégorie doit contenir au moins 3 caractères.')
});
