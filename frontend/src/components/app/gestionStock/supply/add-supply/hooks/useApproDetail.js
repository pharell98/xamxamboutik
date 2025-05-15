import { useCallback, useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import localforage from 'localforage';

// Sous-hooks
import { useLoadApproProducts } from './useLoadApproProducts';
import { useCalculateTotal } from './useCalculateTotal';

// Fonctions
import { validateNumber } from './approUtils';
import { generateApproCode } from './generateApproCode';
import { generateProductCode } from '../../../../../../helpers/generateProductCode';
import { useApprovisionnement } from '../../../../../../hooks/useApprovisionnement';
import { useToast } from '../../../../../common/Toast';

export function useApproDetail({ control }) {
  const { submitApprovisionnement } = useApprovisionnement();
  const { addToast } = useToast();

  // RHF : gestion du tableau "products"
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'products'
  });

  // États locaux
  const [localFields, setLocalFields] = useState([]);
  const [transportFee, setTransportFee] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Contrôle du modal d'ajout/édition
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [currentNewProduct, setCurrentNewProduct] = useState(null);
  const [currentEditProduct, setCurrentEditProduct] = useState(null);

  // Pour vider le formulaire après validation
  const [shouldResetBaseFields, setShouldResetBaseFields] = useState(false);

  // 1) Charger les produits depuis localforage
  useLoadApproProducts({
    append,
    addToast,
    setLocalFields,
    setIsLoading
  });

  // 2) Calculer le total
  useCalculateTotal({
    localFields,
    transportFee,
    setTotalAmount
  });

  // Méthodes LocalForage (mise à jour, ajout)
  const updateLocalForageExisting = async (
    productId,
    newPrixAchat,
    newStock
  ) => {
    const saved = (await localforage.getItem('PreAppro')) || {};
    if (saved[productId]) {
      saved[productId].prixAchat =
        newPrixAchat === '' ? null : Number(newPrixAchat);
      saved[productId].quantity = newStock === '' ? null : Number(newStock);
    }
    await localforage.setItem('PreAppro', saved);
  };

  const updateLocalForageNewProduct = async newObj => {
    const saved = (await localforage.getItem('PreAppro')) || {};
    saved[newObj.id] = {
      id: newObj.id,
      libelle: newObj.libelle,
      prixAchat: Number(newObj.prixAchat) || 0,
      quantity: Number(newObj.stockDisponible) || 0,
      category: newObj.categorieId || null,
      regularPrice: newObj.prixVente || '',
      image: newObj.image || null,
      isNew: true,
      isValidated: !!newObj.isValidated,
      seuilRuptureStock: newObj.seuilRuptureStock || ''
    };
    await localforage.setItem('PreAppro', saved);
  };

  // ---------------------------
  //      Handlers
  // ---------------------------
  const handleUpdateProduct = (index, field, value) => {
    try {
      if (
        (field === 'prixAchat' || field === 'stockDisponible') &&
        value !== '' &&
        !validateNumber(value)
      ) {
        return;
      }
      const copy = [...localFields];
      const current = { ...copy[index] };
      if (field === 'libelle') {
        if (!value.trim()) {
          current.libelle = '';
          current.codeProduit = '';
        } else {
          if (value.toLowerCase() !== current.libelle.toLowerCase()) {
            const duplicate = localFields.find(
              (p, i) =>
                i !== index && p.libelle.toLowerCase() === value.toLowerCase()
            );
            if (duplicate) {
              addToast({
                title: 'Attention',
                message: 'Ce produit existe déjà.',
                type: 'warning'
              });
              return;
            }
          }
          current.libelle = value;
          current.codeProduit = generateProductCode({
            productName: value,
            productCategory: current.categorieId
          });
        }
      } else {
        current[field] = value;
      }
      copy[index] = current;
      setLocalFields(copy);
      update(index, current);
      if (current.originalData) {
        updateLocalForageExisting(
          current.originalData.id,
          current.prixAchat,
          current.stockDisponible
        ).catch(e => console.error('Erreur update localforage:', e));
      }
    } catch (error) {
      console.error('Erreur update product:', error);
      addToast({
        title: 'Erreur',
        message: 'Problème lors de la mise à jour du produit',
        type: 'error'
      });
    }
  };

  const handleAddProduct = formValues => {
    if (showAdditionalFields) {
      addToast({
        title: 'Information',
        message:
          'Veuillez valider le produit en cours avant d’en ajouter un nouveau.',
        type: 'info'
      });
      return;
    }
    const { libelle, prixAchat, stockDisponible } = formValues;
    if (
      localFields.some(
        f => f.libelle && f.libelle.toLowerCase() === libelle.toLowerCase()
      )
    ) {
      addToast({
        title: 'Attention',
        message: 'Ce produit existe déjà dans la liste',
        type: 'warning'
      });
      return;
    }
    const newProduct = {
      id: Date.now(),
      libelle,
      prixAchat: prixAchat || '',
      stockDisponible: stockDisponible || '',
      codeProduit: '',
      isNew: true
    };
    setCurrentNewProduct(newProduct);
    setShowAdditionalFields(true);
  };

  const handleSelectSuggestedProduct = useCallback(
    async productData => {
      const alreadyExists = localFields.some(
        p => p.originalData && p.originalData.id === productData.id
      );
      if (alreadyExists) {
        addToast({
          title: 'Info',
          message: 'Ce produit est déjà dans la liste',
          type: 'info'
        });
        return;
      }
      const productToAdd = {
        libelle: productData.libelle,
        prixAchat: productData.prixAchat || '',
        stockDisponible: '',
        seuilRuptureStock: productData.seuilRuptureStock || '',
        id: productData.id,
        categorieId: productData.categorieId || '',
        prixVente: productData.prixVente || '',
        image: productData.image || null,
        originalData: productData,
        isNew: false,
        isValidated: false
      };
      setLocalFields(prev => [...prev, productToAdd]);
      append(productToAdd);
      const saved = (await localforage.getItem('PreAppro')) || {};
      saved[productData.id] = {
        id: productData.id,
        libelle: productData.libelle,
        prixAchat: productData.prixAchat || 0,
        quantity: 0,
        category: productData.categorieId || null,
        regularPrice: productData.prixVente || '',
        image: productData.image || null,
        isNew: false,
        isValidated: false,
        seuilRuptureStock: productData.seuilRuptureStock || ''
      };
      await localforage.setItem('PreAppro', saved);
      addToast({
        title: 'Succès',
        message: 'Produit existant ajouté depuis les suggestions',
        type: 'success'
      });
    },
    [append, localFields, addToast, setLocalFields]
  );

  const handleRemoveProduct = async index => {
    try {
      const prod = localFields[index];
      if (
        (currentNewProduct && currentNewProduct.id === prod.id) ||
        (currentEditProduct && currentEditProduct.id === prod.id)
      ) {
        setShowAdditionalFields(false);
        setCurrentNewProduct(null);
        setCurrentEditProduct(null);
      }
      const saved = (await localforage.getItem('PreAppro')) || {};
      if (prod.originalData) {
        delete saved[prod.originalData.id];
      } else {
        delete saved[prod.id];
      }
      await localforage.setItem('PreAppro', saved);
      if (prod.image?.preview) {
        URL.revokeObjectURL(prod.image.preview);
      }
      const copy = [...localFields];
      copy.splice(index, 1);
      setLocalFields(copy);
      remove(index);
      addToast({
        title: 'Succès',
        message: 'Produit supprimé',
        type: 'success'
      });
    } catch (error) {
      console.error('Erreur remove product:', error);
      addToast({
        title: 'Erreur',
        message: 'Problème lors de la suppression',
        type: 'error'
      });
    }
  };

  const handleEditProduct = product => {
    try {
      const updatedFields = localFields.map(p =>
        p.id === product.id ? { ...p, isEditing: true } : p
      );
      setLocalFields(updatedFields);
      setCurrentEditProduct({ ...product, isEditing: true });
      setShowAdditionalFields(true);
      setCurrentNewProduct(null);
    } catch (error) {
      console.error('Erreur edition product:', error);
      addToast({
        title: 'Erreur',
        message: 'Problème lors de l’édition',
        type: 'error'
      });
    }
  };

  /**
   * Validation finale d’un produit (nouveau ou en cours d’édition).
   * Si le mode manuel est actif, on utilise la valeur saisie.
   * IMPORTANT : On ajoute explicitement la propriété "manualCode" au produit final.
   */
  const handleCompleteProduct = useCallback(
    async formValues => {
      try {
        // Cas EDIT
        if (currentEditProduct) {
          const updated = localFields.map(item => {
            if (item.originalData) {
              if (
                currentEditProduct.originalData &&
                item.originalData.id === currentEditProduct.originalData.id
              ) {
                return {
                  ...item,
                  codeProduit: formValues.manualCode
                    ? formValues.codeProduit
                    : generateProductCode({
                        productName: item.libelle,
                        productCategory: formValues.categorieId
                      }),
                  categorieId: formValues.categorieId,
                  prixVente: formValues.prixVente,
                  image: formValues.useImageURL
                    ? null
                    : formValues.image || item.image,
                  imageURL: formValues.useImageURL ? formValues.imageURL : null,
                  useImageURL: formValues.useImageURL,
                  seuilRuptureStock: formValues.seuilRuptureStock || '',
                  isEditing: false,
                  manualCode: formValues.manualCode
                };
              }
            } else {
              if (item.id === currentEditProduct.id) {
                return {
                  ...item,
                  codeProduit: formValues.manualCode
                    ? formValues.codeProduit
                    : generateProductCode({
                        productName: item.libelle,
                        productCategory: formValues.categorieId
                      }),
                  categorieId: formValues.categorieId,
                  prixVente: formValues.prixVente,
                  image: formValues.useImageURL
                    ? null
                    : formValues.image || item.image,
                  imageURL: formValues.useImageURL ? formValues.imageURL : null,
                  useImageURL: formValues.useImageURL,
                  seuilRuptureStock: formValues.seuilRuptureStock || '',
                  isEditing: false,
                  manualCode: formValues.manualCode
                };
              }
            }
            return item;
          });
          setLocalFields(updated);
          const editedProduct = updated.find(
            p => p.id === currentEditProduct.id
          );
          if (editedProduct) {
            if (editedProduct.originalData) {
              await updateLocalForageExisting(
                editedProduct.originalData.id,
                editedProduct.prixAchat,
                editedProduct.stockDisponible
              );
            } else {
              await updateLocalForageNewProduct(editedProduct);
            }
          }
          addToast({
            title: 'Succès',
            message: 'Produit modifié avec succès',
            type: 'success'
          });
        }
        // Cas ADD (nouveau produit)
        else if (currentNewProduct) {
          if (!formValues.categorieId || !formValues.prixVente) {
            addToast({
              title: 'Attention',
              message: 'Veuillez remplir la catégorie et le prix de vente',
              type: 'warning'
            });
            return;
          }
          const finalNew = {
            ...currentNewProduct,
            manualCode: formValues.manualCode,
            categorieId: formValues.categorieId,
            prixVente: formValues.prixVente,
            // On conserve le Blob dans "file" et on stocke le nom du fichier dans "image"
            file: formValues.useImageURL ? null : formValues.image,
            image: formValues.useImageURL
              ? null
              : formValues.image instanceof Blob
              ? formValues.image.name
              : formValues.image,
            imageURL: formValues.useImageURL ? formValues.imageURL : null,
            useImageURL: formValues.useImageURL,
            isValidated: true,
            codeProduit: formValues.manualCode
              ? formValues.codeProduit
              : generateProductCode({
                  productName: currentNewProduct.libelle,
                  productCategory: formValues.categorieId
                }),
            seuilRuptureStock: formValues.seuilRuptureStock || ''
          };
          const updated = [...localFields, finalNew];
          setLocalFields(updated);
          append(finalNew);
          setShouldResetBaseFields(true);
          await updateLocalForageNewProduct(finalNew);
          addToast({
            title: 'Succès',
            message: 'Produit ajouté avec succès',
            type: 'success'
          });
        }
        setShowAdditionalFields(false);
        setCurrentNewProduct(null);
        setCurrentEditProduct(null);
      } catch (error) {
        console.error('Erreur validation infos:', error);
        addToast({
          title: 'Erreur',
          message: 'Problème lors de la validation',
          type: 'error'
        });
      }
    },
    [currentEditProduct, currentNewProduct, localFields, append, addToast]
  );

  const handleSubmitAppro = async () => {
    if (showAdditionalFields) return;
    if (!localFields.length) {
      addToast({
        title: 'Attention',
        message: 'Ajoutez au moins un produit avant de soumettre',
        type: 'warning'
      });
      return;
    }
    for (const product of localFields) {
      if (
        !product.libelle ||
        product.stockDisponible === '' ||
        product.stockDisponible === null ||
        product.prixAchat === '' ||
        product.prixAchat === null ||
        Number(product.prixAchat) <= 0
      ) {
        addToast({
          title: 'Erreur',
          message: `Champs obligatoires manquants ou invalides pour "${
            product.libelle || 'Sans nom'
          }".`,
          type: 'error'
        });
        return;
      }
    }
    setIsLoading(true);

    const produitExitant = [];
    const newproduit = [];
    for (const product of localFields) {
      const base = {
        libelle: product.libelle,
        quantite: Number(product.stockDisponible)
      };
      if (product.originalData) {
        produitExitant.push({
          id: product.originalData.id,
          ...base,
          prixAchat: Number(product.prixAchat)
        });
      } else {
        if (!product.categorieId || !product.prixVente) {
          addToast({
            title: 'Erreur',
            message: `Infos manquantes pour le nouveau produit "${product.libelle}"`,
            type: 'error'
          });
          setIsLoading(false);
          return;
        }
        newproduit.push({
          codeProduit: product.manualCode
            ? product.codeProduit
            : generateProductCode({
                productName: product.libelle,
                productCategory: product.categorieId
              }),
          libelle: product.libelle,
          prixAchat: Number(product.prixAchat),
          prixVente: Number(product.prixVente),
          stockDisponible: Number(product.stockDisponible),
          categorieId: Number(product.categorieId),
          seuilRuptureStock: Number(product.seuilRuptureStock) || 0,
          // Pour le champ image, s'assurer qu'il s'agit d'une chaîne
          image: product.useImageURL
            ? null
            : product.image instanceof Blob
            ? product.image.name
            : product.image,
          imageURL: product.useImageURL ? product.imageURL : null,
          useImageURL: product.useImageURL
        });
      }
    }

    const dto = {
      codeAppro: generateApproCode(),
      produitExitant,
      newproduit,
      fraisTransport: Number(transportFee) || 0,
      montantTotal: totalAmount
    };

    console.log('DTO envoyé au backend :', dto);

    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(dto)], {
      type: 'application/json'
    });
    formData.append('dto', jsonBlob, 'dto.json');

    // Ajout des fichiers pour les nouveaux produits en utilisant la propriété "file"
    newproduit.forEach(np => {
      const matchingObj = localFields.find(
        lf => lf.libelle === np.libelle && lf.isNew
      );
      if (matchingObj && matchingObj.file instanceof Blob) {
        formData.append('newproduitImages', matchingObj.file);
      }
    });

    for (let pair of formData.entries()) {
      console.log(pair[0] + ' : ', pair[1]);
    }

    try {
      await submitApprovisionnement(formData);
      localFields.forEach(p => {
        if (p.image?.preview) {
          URL.revokeObjectURL(p.image.preview);
        }
      });
      await localforage.removeItem('PreAppro');
      setLocalFields([]);
      setTransportFee('');
      fields.forEach((_, idx) => remove(idx));
      addToast({
        title: 'Succès',
        message: 'Approvisionnement enregistré avec succès',
        type: 'success'
      });
    } catch (error) {
      console.error(
        "Erreur lors de la création de l'approvisionnement :",
        error
      );
      addToast({
        title: 'Erreur',
        message: error.message || "Impossible de créer l'approvisionnement",
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllProducts = async () => {
    try {
      localFields.forEach(product => {
        if (product.image?.preview) {
          URL.revokeObjectURL(product.image.preview);
        }
      });
      await localforage.removeItem('PreAppro');
      setLocalFields([]);
      setTransportFee('');
      fields.forEach((_, i) => remove(i));
      addToast({
        title: 'Succès',
        message: 'Tous les produits ont été supprimés',
        type: 'success'
      });
    } catch (error) {
      console.error('Erreur clearAll:', error);
      addToast({
        title: 'Erreur',
        message: 'Impossible de vider la liste',
        type: 'error'
      });
    }
  };

  return {
    isLoading,
    localFields,
    transportFee,
    totalAmount,
    showAdditionalFields,
    currentNewProduct,
    currentEditProduct,
    shouldResetBaseFields,
    setShouldResetBaseFields,
    setTransportFee,
    setShowAdditionalFields,
    setCurrentNewProduct,
    setCurrentEditProduct,
    handleUpdateProduct,
    handleAddProduct,
    handleSelectSuggestedProduct,
    handleRemoveProduct,
    handleEditProduct,
    handleCompleteProduct,
    handleSubmitAppro,
    clearAllProducts
  };
}
