import React, { useCallback, useRef, useState } from 'react';
import { useProductContext } from 'providers/ProductProvider';
import { useToast } from '../../../common/Toast';
import { v4 as uuidv4 } from 'uuid';

import ScannerToggle from './ScannerToggle';
import CameraScanner from './CameraScanner';
import useBarcodeScanner from './useBarcodeScanner';
import apiServiceV1 from 'services/api.service.v1';

// Constants
const TOAST_DUPLICATE_TIMEOUT = 2000;
const ERROR_MESSAGES = {
  404: { title: 'Produit introuvable', type: 'warning' },
  500: {
    title: 'Erreur serveur',
    message: 'Problème temporaire',
    type: 'error'
  },
  0: {
    title: 'Connexion perdue',
    message: 'Vérifiez votre connexion',
    type: 'error'
  },
  default: { title: 'Erreur', message: 'Erreur de récupération', type: 'error' }
};

const BarcodeScanner = () => {
  const { productsDispatch } = useProductContext();
  const { addToast } = useToast();
  const [scannerMode, setScannerMode] = useState('usb');

  // Toast deduplication
  const lastToastRef = useRef({ message: '', time: 0 });

  // Toast handler with deduplication
  const showToast = useCallback(
    (title, message, type, duration = 4000) => {
      const now = Date.now();
      const { message: lastMessage, time: lastTime } = lastToastRef.current;

      if (message === lastMessage && now - lastTime < TOAST_DUPLICATE_TIMEOUT) {
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

      lastToastRef.current = { message, time: now };
    },
    [addToast]
  );

  // Add product to cart
  const addProductToCart = useCallback(
    product => {
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
    },
    [productsDispatch]
  );

  // Handle API errors
  const handleScanError = useCallback(
    (error, code) => {
      const status = error.response?.status;
      const errorConfig = ERROR_MESSAGES[status] || ERROR_MESSAGES.default;

      const message =
        status === 404
          ? `Code ${code} non enregistré`
          : error.response?.data?.message ||
            error.message ||
            errorConfig.message;

      showToast(errorConfig.title, message, errorConfig.type);
    },
    [showToast]
  );

  // Generic scan handler
  const handleScan = useCallback(
    async code => {
      try {
        const response = await apiServiceV1.getProductByBarcode(code);

        if (response.success && response.data) {
          addProductToCart(response.data);
        } else {
          showToast(
            'Produit introuvable',
            `Code ${code} non enregistré`,
            'warning'
          );
        }
      } catch (error) {
        handleScanError(error, code);
      }
    },
    [addProductToCart, showToast, handleScanError]
  );

  // USB Scanner setup
  const { containerRef, handleKeyDown } = useBarcodeScanner(
    handleScan,
    scannerMode === 'usb'
  );

  // Event handlers
  const handleContainerClick = useCallback(e => e.stopPropagation(), []);
  const handleMouseEvent = useCallback(e => e.stopPropagation(), []);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      style={{ outline: 'none', position: 'relative' }}
      onKeyDown={handleKeyDown}
      onClick={handleContainerClick}
      onMouseDown={handleMouseEvent}
      onMouseUp={handleMouseEvent}
    >
      <ScannerToggle
        scannerMode={scannerMode}
        setScannerMode={setScannerMode}
      />
      {scannerMode === 'camera' && <CameraScanner onScan={handleScan} />}
    </div>
  );
};

export default BarcodeScanner;
