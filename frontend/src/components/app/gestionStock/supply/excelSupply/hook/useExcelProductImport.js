// src/views/hook/useExcelProductImport.js

import { useState } from 'react';
import { generateProductCode } from '../../../../../../helpers/generateProductCode';
import validateHeaders from '../HeaderValidator';
import apiServiceV1 from '../../../../../../services/api.service.v1';
import { useToast } from '../../../../../common/Toast';

// Mapping des nouveaux headers vers les anciens noms pour la compatibilité
const HEADER_MAPPING = {
  'code produit': 'codeProduit',
  libelle: 'libelle',
  'prix achat': 'prixAchat',
  'prix vente': 'prixVente',
  'stock disponible': 'stockDisponible',
  'seuil rupture stock': 'seuilRuptureStock',
  'categorie produit': 'categorieProduit',
  'image url': 'imageURL'
};

const useExcelProductImport = ({ onImportSuccess } = {}) => {
  const [data, setData] = useState([]);
  const [modifiedData, setModifiedData] = useState([]); // Nouvel état pour les données modifiées
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const generateCodesForData = rawData => {
    if (!rawData || rawData.length < 2) {
      return rawData;
    }

    // Nettoyer les données avant la génération des codes
    const cleanedData = cleanData(rawData);

    const headers = cleanedData[0];
    const rows = cleanedData.slice(1).map((row, index) => {
      const product = headers.reduce((acc, key, idx) => {
        acc[key] = row[idx] !== undefined ? row[idx] : '';
        return acc;
      }, {});

      // Generate code if missing but required fields present
      const hasCode =
        product['code produit'] &&
        String(product['code produit']).trim() !== '';
      const hasFields =
        product.libelle &&
        String(product.libelle).trim() !== '' &&
        product['categorie produit'] &&
        String(product['categorie produit']).trim() !== '';

      if (!hasCode && hasFields) {
        try {
          product['code produit'] = generateProductCode({
            productName: String(product.libelle).trim(),
            productCategory: String(product['categorie produit']).trim()
          });
        } catch (error) {
          addToast({
            title: 'Erreur',
            message: `Erreur génération du code pour ${product.libelle}`,
            type: 'error'
          });
        }
      }

      return headers.map(key => product[key]);
    });

    return [headers, ...rows];
  };

  // Fonction pour régénérer les codes des données modifiées
  const regenerateCodesForModifiedData = modifiedData => {
    if (!modifiedData || modifiedData.length < 2) {
      return modifiedData;
    }

    return generateCodesForData(modifiedData);
  };

  // Fonction pour nettoyer les espaces inutiles
  const cleanData = rawData => {
    if (!rawData || rawData.length < 2) return rawData;

    const headers = rawData[0];
    const rows = rawData.slice(1).map(row =>
      row.map(cell => {
        if (cell === null || cell === undefined) return '';
        if (typeof cell === 'string') {
          // Supprimer les espaces avant et après, et remplacer les espaces multiples par un seul espace
          return cell.trim().replace(/\s+/g, ' ');
        }
        // Pour les nombres, les convertir en string puis nettoyer
        if (typeof cell === 'number') {
          return cell.toString().trim();
        }
        return cell;
      })
    );

    return [headers, ...rows];
  };

  const formatProductData = rawData => {
    if (!rawData || rawData.length < 2) return [];

    // Les données sont déjà nettoyées avant d'arriver ici
    const headers = rawData[0];
    // Remove completely empty rows
    const rows = rawData
      .slice(1)
      .filter(row => row.some(cell => cell !== undefined && cell !== ''));

    return rows.map(row => {
      const product = headers.reduce((acc, key, idx) => {
        if (row[idx] !== undefined && row[idx] !== '') {
          acc[key] = row[idx];
        }
        return acc;
      }, {});

      // Mapper les nouveaux headers vers les anciens noms pour le backend
      const mappedProduct = {};
      Object.keys(product).forEach(newKey => {
        const oldKey = HEADER_MAPPING[newKey];
        if (oldKey) {
          mappedProduct[oldKey] = product[newKey];
        }
      });

      // Format adapté pour ApprovisionnementExcelRequestDTO
      mappedProduct.categorieName = String(
        mappedProduct.categorieProduit || ''
      ).trim();
      mappedProduct.categorieId = 0;
      mappedProduct.imageURL = mappedProduct.imageURL
        ? String(mappedProduct.imageURL).trim()
        : '';
      mappedProduct.useImageURL = !!mappedProduct.imageURL;
      mappedProduct.prixAchat = mappedProduct.prixAchat
        ? Number(mappedProduct.prixAchat)
        : 0.0;
      mappedProduct.prixVente = mappedProduct.prixVente
        ? Number(mappedProduct.prixVente)
        : 0.0;
      mappedProduct.stockDisponible = mappedProduct.stockDisponible
        ? Number(mappedProduct.stockDisponible)
        : 0;
      mappedProduct.seuilRuptureStock = mappedProduct.seuilRuptureStock
        ? Number(mappedProduct.seuilRuptureStock)
        : 0;
      mappedProduct.id = null;

      return mappedProduct;
    });
  };

  const handleDataUpload = (uploadedData, error) => {
    if (error) {
      addToast({
        title: 'Erreur',
        message: error.message || 'Erreur lors du chargement du fichier Excel.',
        type: 'error'
      });
      return;
    }

    if (!Array.isArray(uploadedData) || uploadedData.length < 2) {
      addToast({
        title: 'Attention',
        message: 'Pas de données valides à importer.',
        type: 'warning'
      });
      setData(uploadedData || []);
      setModifiedData(uploadedData || []); // Initialiser aussi les données modifiées
      return;
    }

    const headers = uploadedData[0];
    const validation = validateHeaders(headers);
    if (!validation.isValid) {
      addToast({
        title: 'Erreur',
        message: validation.message,
        type: 'error'
      });
      return;
    }

    const processedData = generateCodesForData(uploadedData);
    setData(processedData);
    setModifiedData(processedData); // Initialiser les données modifiées avec les données traitées
  };

  // Fonction pour mettre à jour les données modifiées
  const updateModifiedData = newData => {
    // Régénérer les codes si les champs libelle ou categorie produit ont été modifiés
    const processedData = regenerateCodesForModifiedData(newData);
    setModifiedData(processedData);
  };

  const sendToBackend = async () => {
    // Utiliser les données modifiées au lieu des données originales
    const dataToSend = modifiedData.length > 0 ? modifiedData : data;

    if (!dataToSend || dataToSend.length < 2) {
      addToast({
        title: 'Attention',
        message: 'Pas de données à importer.',
        type: 'warning'
      });
      return false;
    }

    setLoading(true);
    try {
      // === LOG AVANCÉ DES DONNÉES ===
      console.log('🚀 === LOG AVANCÉ - DONNÉES EXCEL AVANT ENVOI ===');
      console.log('📊 Données brutes (dataToSend):', dataToSend);

      // Log du nettoyage des espaces
      console.log('🧹 === NETTOYAGE DES ESPACES ===');
      const cleanedData = cleanData(dataToSend);
      console.log('📊 Données après nettoyage:', cleanedData);

      // Comparaison avant/après nettoyage
      if (dataToSend.length > 1 && cleanedData.length > 1) {
        console.log('🔍 Comparaison avant/après nettoyage:');
        for (
          let i = 1;
          i < Math.min(dataToSend.length, cleanedData.length);
          i++
        ) {
          const originalRow = dataToSend[i];
          const cleanedRow = cleanedData[i];
          let hasChanges = false;

          for (
            let j = 0;
            j < Math.min(originalRow.length, cleanedRow.length);
            j++
          ) {
            if (originalRow[j] !== cleanedRow[j]) {
              if (!hasChanges) {
                console.log(`  Ligne ${i}:`);
                hasChanges = true;
              }
              console.log(
                `    Colonne ${j}: "${originalRow[j]}" → "${cleanedRow[j]}"`
              );
            }
          }
        }
      }
      console.log('=== FIN NETTOYAGE ===');

      // Utiliser les données nettoyées pour le formatage
      const formattedData = formatProductData(cleanedData);
      console.log('🔧 Données formatées (formattedData):', formattedData);

      if (formattedData.length === 0) {
        addToast({
          title: 'Info',
          message: 'Aucune ligne non vide à importer.',
          type: 'info'
        });
        return false;
      }

      // Log détaillé de chaque produit
      console.log('📋 Détail des produits à envoyer:');
      formattedData.forEach((product, index) => {
        console.log(`\n📦 Produit ${index + 1}:`);
        console.log('   codeProduit:', product.codeProduit);
        console.log('   libelle:', product.libelle);
        console.log(
          '   prixAchat:',
          product.prixAchat,
          `(${typeof product.prixAchat})`
        );
        console.log(
          '   prixVente:',
          product.prixVente,
          `(${typeof product.prixVente})`
        );
        console.log(
          '   stockDisponible:',
          product.stockDisponible,
          `(${typeof product.stockDisponible})`
        );
        console.log(
          '   seuilRuptureStock:',
          product.seuilRuptureStock,
          `(${typeof product.seuilRuptureStock})`
        );
        console.log('   categorieProduit:', product.categorieProduit);
        console.log('   imageURL:', product.imageURL);
        console.log('   categorieName:', product.categorieName);
        console.log(
          '   categorieId:',
          product.categorieId,
          `(${typeof product.categorieId})`
        );
        console.log(
          '   useImageURL:',
          product.useImageURL,
          `(${typeof product.useImageURL})`
        );
        console.log('   id:', product.id);
      });

      console.log('\n🌐 Endpoint:', '/api/v1/approvisionnements/import/excel');
      console.log('📤 Méthode: POST');
      console.log('📦 Payload JSON:', JSON.stringify(formattedData, null, 2));
      console.log('=== FIN DU LOG AVANCÉ ===\n');

      const result = await apiServiceV1.bulkImportProducts(formattedData);

      // === LOG DE LA RÉPONSE ===
      console.log('📥 === LOG RÉPONSE BACKEND ===');
      console.log('✅ Réponse complète:', result);
      console.log('📊 Structure de la réponse:', typeof result);

      if (result && typeof result === 'object') {
        console.log('🔍 Clés de la réponse:', Object.keys(result));
        if (result.data) {
          console.log('📦 Données de la réponse:', result.data);
          console.log('🔍 Clés des données:', Object.keys(result.data));
        }
      }
      console.log('=== FIN LOG RÉPONSE ===\n');

      const { erreurs = [], produitsEnregistres = [] } = result.data || {};

      if (erreurs.length > 0) {
        erreurs.forEach(msg => {
          addToast({
            title: 'Erreur import',
            message: msg,
            type: 'error'
          });
        });
        return false;
      }

      addToast({
        title: 'Succès',
        message: `${produitsEnregistres.length} produit(s) importé(s).`,
        type: 'success'
      });

      if (onImportSuccess) {
        onImportSuccess(produitsEnregistres);
      }
      setData([]);
      setModifiedData([]); // Réinitialiser aussi les données modifiées
      return true;
    } catch (error) {
      const resp = error.response?.data;
      if (resp?.data?.erreurs) {
        resp.data.erreurs.forEach(msg => {
          addToast({
            title: 'Erreur import',
            message: msg,
            type: 'error'
          });
        });
      } else {
        addToast({
          title: 'Erreur',
          message:
            resp?.message || error.message || "Erreur lors de l'importation.",
          type: 'error'
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    modifiedData, // Exposer les données modifiées
    loading,
    handleDataUpload,
    sendToBackend,
    setData,
    updateModifiedData // Exposer la fonction de mise à jour
  };
};

export default useExcelProductImport;
