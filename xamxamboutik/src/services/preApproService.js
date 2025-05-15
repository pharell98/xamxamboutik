// preApproService.js (optimisé)
import localforage from 'localforage';

const PRE_APPRO_KEY = 'PreAppro';

export const setPreAppro = async products => {
  try {
    await localforage.setItem(PRE_APPRO_KEY, products);
  } catch (error) {
    console.error('Erreur setPreAppro:', error);
  }
};

export const getPreAppro = async () => {
  try {
    return (await localforage.getItem(PRE_APPRO_KEY)) || {};
  } catch (error) {
    console.error('Erreur getPreAppro:', error);
    return {};
  }
};

export const addProduct = async product => {
  try {
    const current = (await getPreAppro()) || {};
    if (!current[product.id]) {
      current[product.id] = {
        id: product.id,
        libelle: product.libelle,
        prixAchat: product.prixAchat
      };
      await setPreAppro(current);
    }
  } catch (error) {
    console.error('Erreur addProduct', error);
  }
};

export const removeProduct = async id => {
  try {
    const current = (await getPreAppro()) || {};
    delete current[id];
    await setPreAppro(current);
  } catch (error) {
    console.error('Erreur removeProduct', error);
  }
};
