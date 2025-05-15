// Fonctions pures
export function validateNumber(value) {
  return value === '' || /^\d*\.?\d*$/.test(value);
}
