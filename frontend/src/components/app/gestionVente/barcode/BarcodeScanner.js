import React, { useEffect, useRef, useState } from 'react';
import { useProductContext } from 'providers/ProductProvider';
import ScannerToggle from './ScannerToggle';
import CameraScanner from './CameraScanner';
import apiServiceV1 from 'services/api.service.v1';
import venteServiceV1 from 'services/vente.service.v1';
import { useToast } from '../../../common/Toast';
import { v4 as uuidv4 } from 'uuid';
import useBarcodeScanner from './useBarcodeScanner';

const BarcodeScanner = () => {
  const { productsDispatch } = useProductContext();
  const { addToast } = useToast();
  const [scannerMode, setScannerMode] = useState('usb');
  const lastToastMessageRef = useRef('');
  const lastToastTimeRef = useRef(0);

  const showToast = (title, message, type, duration) => {
    const now = Date.now();
    if (
      message === lastToastMessageRef.current &&
      now - lastToastTimeRef.current < 2000
    ) {
      return;
    }
    addToast({
      id: `${uuidv4()}-${now}`,
      title,
      message,
      type,
      duration,
      'data-toast-message': message
    });
    lastToastMessageRef.current = message;
    lastToastTimeRef.current = now;
  };

  // Fonction de traitement du scan USB
  const handleUsbScan = async (code) => {
    try {
      console.log('[BarcodeScanner] Recherche du produit avec le code:', code);
      const response = await apiServiceV1.getProductByBarcode(code);
      console.log('[BarcodeScanner] Réponse API complète:', response);
      
      if (response.success && response.data) {
        const product = response.data;
        console.log('[BarcodeScanner] Produit trouvé:', product);
        
        productsDispatch({
          type: 'ADD_TO_CART',
          payload: {
            product: {
              ...product,
              quantity: 1,
              totalPrice: product.prixVente
            }
          }
        });
        
        // Toast de succès supprimé
      } else {
        console.error('[BarcodeScanner] Produit non trouvé pour le code:', code);
        showToast('Erreur', 'Produit non trouvé', 'error', 5000);
      }
    } catch (error) {
      console.error('[BarcodeScanner] Erreur lors de la récupération du produit:', error);
      console.error('[BarcodeScanner] Détails de l\'erreur:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la récupération du produit';
      showToast(
        'Erreur',
        errorMessage,
        'error',
        5000
      );
    }
  };

  // Fonction de traitement du scan caméra
  const handleCameraScan = async (code) => {
    try {
      console.log('[BarcodeScanner] Recherche du produit avec le code (camera):', code);
      const response = await apiServiceV1.getProductByBarcode(code);
      console.log('[BarcodeScanner] Réponse API complète (camera):', response);
        
      if (response.success && response.data) {
        const product = response.data;
        console.log('[BarcodeScanner] Produit trouvé (camera):', product);
        
        productsDispatch({
          type: 'ADD_TO_CART',
          payload: {
            product: { ...product, quantity: 1, totalPrice: product.prixVente }
          }
        });
        
        // Toast de succès supprimé
      } else {
        console.error('[BarcodeScanner] Produit non trouvé pour le code (camera):', code);
        showToast('Erreur', 'Produit non trouvé', 'error', 5000);
      }
    } catch (error) {
      console.error('[BarcodeScanner] Erreur lors de la récupération du produit (camera):', error);
      console.error('[BarcodeScanner] Détails de l\'erreur (camera):', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la récupération du produit';
      showToast(
        'Erreur',
        errorMessage,
        'error',
        5000
      );
    }
  };

  // Utilisation du hook personnalisé pour le scanner USB
  const { containerRef, handleKeyDown, handleBlur, isProcessing } = useBarcodeScanner(
    handleUsbScan,
    scannerMode === 'usb'
  );

  // Gestionnaire pour éviter les interférences avec la navbar
  const handleFocus = () => {
    console.log('[BarcodeScanner] Scanner focusé');
  };

  const handleClick = (e) => {
    // Empêcher la propagation pour éviter les conflits
    e.stopPropagation();
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      style={{ 
        outline: 'none',
        position: 'relative'
      }}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      <ScannerToggle
        scannerMode={scannerMode}
        setScannerMode={setScannerMode}
      />
      {scannerMode === 'camera' && <CameraScanner onScan={handleCameraScan} />}
    </div>
  );
};

export default BarcodeScanner;
