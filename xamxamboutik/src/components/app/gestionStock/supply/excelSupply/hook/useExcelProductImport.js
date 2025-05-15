// src/views/hook/useExcelProductImport.js

import { useState } from 'react';
import { generateProductCode } from '../../../../../../helpers/generateProductCode';
import validateHeaders from '../HeaderValidator';
import apiServiceV1 from '../../../../../../services/api.service.v1';
import { useToast } from '../../../../../common/Toast';

const useExcelProductImport = ({ onImportSuccess } = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const generateCodesForData = rawData => {
    if (!rawData || rawData.length < 2) {
      return rawData;
    }

    const headers = rawData[0];
    const rows = rawData.slice(1).map((row, index) => {
      const product = headers.reduce((acc, key, idx) => {
        acc[key] = row[idx] !== undefined ? row[idx] : '';
        return acc;
      }, {});

      // Generate code if missing but required fields present
      const hasCode =
        product.codeProduit && String(product.codeProduit).trim() !== '';
      const hasFields =
        product.libelle &&
        String(product.libelle).trim() !== '' &&
        product.categorieProduit &&
        String(product.categorieProduit).trim() !== '';

      if (!hasCode && hasFields) {
        try {
          product.codeProduit = generateProductCode({
            productName: String(product.libelle).trim(),
            productCategory: String(product.categorieProduit).trim()
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

  const formatProductData = rawData => {
    if (!rawData || rawData.length < 2) return [];

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

      product.categorieName = String(product.categorieProduit || '').trim();
      product.categorieId = 0;
      product.imageURL = product.imageURL
        ? String(product.imageURL).trim()
        : '';
      product.useImageURL = !!product.imageURL;
      product.prixAchat = product.prixAchat ? Number(product.prixAchat) : 0;
      product.prixVente = product.prixVente ? Number(product.prixVente) : 0;
      product.stockDisponible = product.stockDisponible
        ? Number(product.stockDisponible)
        : 0;
      product.seuilRuptureStock = product.seuilRuptureStock
        ? Number(product.seuilRuptureStock)
        : 0;
      product.id = null;

      return product;
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

    setData(generateCodesForData(uploadedData));
  };

  const sendToBackend = async () => {
    if (!data || data.length < 2) {
      addToast({
        title: 'Attention',
        message: 'Pas de données à importer.',
        type: 'warning'
      });
      return false;
    }

    setLoading(true);
    try {
      const formattedData = formatProductData(data);
      if (formattedData.length === 0) {
        addToast({
          title: 'Info',
          message: 'Aucune ligne non vide à importer.',
          type: 'info'
        });
        return false;
      }

      const result = await apiServiceV1.bulkImportProducts(formattedData);
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
            resp?.message || error.message || 'Erreur lors de l’importation.',
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
    loading,
    handleDataUpload,
    sendToBackend,
    setData
  };
};

export default useExcelProductImport;
