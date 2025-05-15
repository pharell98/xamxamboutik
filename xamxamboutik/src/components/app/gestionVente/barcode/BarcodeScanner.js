import React, { useEffect, useRef, useState } from 'react';
import { useProductContext } from 'providers/ProductProvider';
import ScannerToggle from './ScannerToggle';
import CameraScanner from './CameraScanner';
import venteServiceV1 from 'services/api.service.v1';
import { useToast } from '../../../common/Toast';
import { v4 as uuidv4 } from 'uuid';

const BarcodeScanner = () => {
  const { productsDispatch } = useProductContext();
  const { addToast } = useToast();
  const [scannerMode, setScannerMode] = useState('usb');
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeRef = useRef('');
  const lastToastMessageRef = useRef('');
  const lastToastTimeRef = useRef(0);
  const containerRef = useRef(null);

  const isValidBarcode = barcode => /^\d{13}$/.test(barcode);

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

  useEffect(() => {
    // Synchronise la ref avec l'état actuel
    barcodeRef.current = barcodeInput;
  }, [barcodeInput]);

  useEffect(() => {
    // Focus sur le conteneur pour capter les événements clavier dès le montage ou changement de mode
    if (scannerMode === 'usb' && containerRef.current) {
      containerRef.current.focus();
    }
  }, [scannerMode]);

  const handleKeyDown = async event => {
    if (scannerMode !== 'usb') return;
    const key = event.key;
    if (key === 'Enter') {
      const code = barcodeRef.current;
      setBarcodeInput('');
      if (!isValidBarcode(code)) {
        showToast(
          'Erreur',
          'Le code-barres doit contenir exactement 13 chiffres',
          'error',
          5000
        );
        return;
      }
      try {
        const response = await venteServiceV1.getProductByBarcode(code);
        if (response.success && response.data) {
          const product = response.data;
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
        } else {
          showToast('Erreur', 'Produit non trouvé', 'error', 5000);
        }
      } catch (error) {
        showToast(
          'Erreur',
          `Erreur lors de la récupération du produit: ${error.message}`,
          'error',
          5000
        );
      }
    } else if (key.length === 1) {
      setBarcodeInput(prev => prev + key);
    }
  };

  const handleCameraScan = async code => {
    if (!isValidBarcode(code)) {
      showToast(
        'Erreur',
        'Le code-barres doit contenir exactement 13 chiffres',
        'error',
        5000
      );
      return;
    }
    try {
      const response = await venteServiceV1.getProductByBarcode(code);
      if (response.success && response.data) {
        const product = response.data;
        productsDispatch({
          type: 'ADD_TO_CART',
          payload: {
            product: { ...product, quantity: 1, totalPrice: product.prixVente }
          }
        });
      } else {
        showToast('Erreur', 'Produit non trouvé', 'error', 5000);
      }
    } catch (error) {
      showToast(
        'Erreur',
        `Erreur lors de la récupération du produit: ${error.message}`,
        'error',
        5000
      );
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      style={{ outline: 'none' }}
      onKeyDown={handleKeyDown}
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
