import { useEffect } from 'react';
import localforage from 'localforage';

export function useLoadApproProducts({
  append,
  addToast,
  setLocalFields,
  setIsLoading
}) {
  useEffect(() => {
    const loadSelectedProducts = async () => {
      try {
        const savedProducts = await localforage.getItem('PreAppro');
        if (savedProducts && Object.keys(savedProducts).length > 0) {
          const formattedProducts = Object.values(savedProducts).map(item => ({
            libelle: item.libelle,
            prixAchat: item.prixAchat || '',
            stockDisponible: item.quantity || '',
            seuilRuptureStock: item.seuilRuptureStock || '',
            id: item.id,

            categorieId: item.category || '',
            prixVente: item.regularPrice || '',
            image: item.image || null,

            // Si c’est un "nouveau" (isNew = true), on n’a pas originalData
            originalData: item.isNew ? null : item,
            isNew: !!item.isNew,
            isValidated: !!item.isValidated
          }));

          // Mémoriser dans le state
          setLocalFields(formattedProducts);

          // Ajouter au tableau RHF (useFieldArray)
          formattedProducts.forEach(product => append(product));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        addToast({
          title: 'Erreur',
          message: 'Erreur lors du chargement des produits',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSelectedProducts();
  }, [append, addToast, setIsLoading, setLocalFields]);
}
