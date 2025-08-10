import React, { useCallback, useEffect, useRef } from 'react';

/**
 * Hook personnalisé pour gérer les événements clavier du scanner de code-barres
 * Évite les interférences avec d'autres éléments de l'interface
 */
const useBarcodeScanner = (onScan, isActive = true) => {
  const containerRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const isProcessingRef = useRef(false);
  const barcodeBufferRef = useRef('');
  const barcodeTimeoutRef = useRef(null);

  // Vérifier si un élément est actif (input, textarea, select, etc.)
  const isElementActive = useCallback((element) => {
    if (!element) return false;
    
    // Vérifier si l'élément est un champ de saisie
    const isInputField = element.tagName === 'INPUT' || 
                        element.tagName === 'TEXTAREA' || 
                        element.tagName === 'SELECT' ||
                        element.contentEditable === 'true';
    
    // Vérifier si l'élément a des attributs de saisie
    const hasInputAttributes = element.type === 'text' || 
                             element.type === 'number' || 
                             element.type === 'tel' || 
                             element.type === 'email' || 
                             element.type === 'password' ||
                             element.type === 'search' ||
                             element.type === 'url';
    
    // Vérifier si l'élément est dans un formulaire
    const isInForm = element.closest('form') !== null;
    
    // Vérifier si l'élément est un bouton ou lien
    const isButtonOrLink = element.tagName === 'BUTTON' || 
                          element.tagName === 'A' ||
                          element.role === 'button' ||
                          element.role === 'link';
    
    // Vérifier si l'élément est dans le panier (CartSection)
    const isInCart = element.closest('.cart-section') !== null ||
                    element.closest('.cart-item') !== null ||
                    element.closest('.quantity-controller') !== null ||
                    element.closest('.price-wrapper') !== null;
    
    return isInputField || hasInputAttributes || isInForm || isButtonOrLink || isInCart;
  }, []);

  // Vérifier si on est dans une modal
  const isInModal = useCallback(() => {
    const activeElement = document.activeElement;
    if (!activeElement) return false;
    
    // Vérifier si l'élément actif est dans une modal
    const modal = activeElement.closest('.modal') || 
                 activeElement.closest('[role="dialog"]') ||
                 activeElement.closest('.popover') ||
                 activeElement.closest('.dropdown-menu');
    
    return modal !== null;
  }, []);

  // Vérifier si on est dans la navbar
  const isInNavbar = useCallback((element) => {
    if (!element) return false;
    
    // Vérifier si l'élément est dans la navbar
    const navbar = element.closest('.navbar') || 
                  element.closest('.nav') ||
                  element.closest('.sidebar') ||
                  element.closest('.navbar-vertical') ||
                  element.closest('.navbar-top');
    
    return navbar !== null;
  }, []);

  // Valider le format du code-barres
  const isValidBarcode = useCallback((code) => {
    // Code-barres standard : 13 chiffres
    return /^\d{13}$/.test(code);
  }, []);

  // Traiter le code-barres collecté
  const processBarcode = useCallback(async (barcode) => {
    if (isProcessingRef.current) {
      console.log('[useBarcodeScanner] Traitement en cours, scan ignoré');
      return;
    }
    
    isProcessingRef.current = true;
    lastScanTimeRef.current = Date.now();
    
    console.log('[useBarcodeScanner] Traitement du code:', barcode);
    
    try {
      await onScan(barcode);
    } catch (error) {
      console.error('[useBarcodeScanner] Erreur lors du scan:', error);
    } finally {
      // Réinitialiser après un délai
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1000);
    }
  }, [onScan]);

  // Gestionnaire principal des événements clavier
  const handleKeyDown = useCallback((event) => {
    if (!isActive) return;
    
    const now = Date.now();
    const key = event.key;

    // Éviter les scans trop rapides
    if (now - lastScanTimeRef.current < 1000) {
      console.log('[useBarcodeScanner] Scan ignoré - trop rapide');
      return;
    }

    const activeElement = document.activeElement;
    
    // Ignorer si on est dans la navbar
    if (isInNavbar(activeElement)) {
      console.log('[useBarcodeScanner] Élément navbar actif, scan ignoré:', activeElement);
      return;
    }
    
    // Ignorer si un élément actif est détecté (sauf le container du scanner)
    if (isElementActive(activeElement) && activeElement !== containerRef.current) {
      console.log('[useBarcodeScanner] Élément actif détecté, scan ignoré:', activeElement);
      return;
    }
    
    // Ignorer si on est dans une modal
    if (isInModal()) {
      console.log('[useBarcodeScanner] Modal détecté, scan ignoré');
      return;
    }

    // Ignorer les touches de navigation et spéciales
    const navigationKeys = [
      'Tab', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 
      'Home', 'End', 'PageUp', 'PageDown', 'F1', 'F2', 'F3', 'F4', 'F5', 
      'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Meta', 'Alt', 'Ctrl',
      'Shift', 'CapsLock', 'NumLock', 'ScrollLock'
    ];
    
    if (navigationKeys.includes(key)) {
      return;
    }

    // Traitement du code-barres
    if (key === 'Enter') {
      // Fin du scan - traiter le code-barres
      const barcode = barcodeBufferRef.current;
      if (barcode && barcode.length > 0) {
        if (isValidBarcode(barcode)) {
          processBarcode(barcode);
        } else {
          console.log('[useBarcodeScanner] Code-barres invalide:', barcode);
        }
        // Réinitialiser le buffer
        barcodeBufferRef.current = '';
      }
      // Nettoyer le timeout
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current);
        barcodeTimeoutRef.current = null;
      }
    } else if (key.length === 1 && /^\d$/.test(key)) {
      // Ajouter le chiffre au buffer
      barcodeBufferRef.current += key;
      
      // Réinitialiser le timeout existant
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current);
      }
      
      // Nouveau timeout pour traiter le code-barres si pas de Enter
      barcodeTimeoutRef.current = setTimeout(() => {
        const barcode = barcodeBufferRef.current;
        if (barcode && barcode.length > 0) {
          if (isValidBarcode(barcode)) {
            processBarcode(barcode);
          } else {
            console.log('[useBarcodeScanner] Code-barres invalide (timeout):', barcode);
          }
          // Réinitialiser le buffer
          barcodeBufferRef.current = '';
        }
        barcodeTimeoutRef.current = null;
      }, 200); // Augmenté à 200ms pour plus de fiabilité
    }
  }, [isActive, isElementActive, isInModal, isInNavbar, isValidBarcode, processBarcode]);

  // Gestionnaire global des événements clavier pour capturer les scans USB
  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      if (!isActive || isProcessingRef.current) return;
      
      const key = event.key;
      const activeElement = document.activeElement;
      
      // Ignorer si l'événement vient déjà du container du scanner pour éviter la duplication
      if (activeElement === containerRef.current) {
        return;
      }
      
      // Ignorer les touches de navigation
      const navigationKeys = [
        'Tab', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 
        'Home', 'End', 'PageUp', 'PageDown', 'F1', 'F2', 'F3', 'F4', 'F5', 
        'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Meta', 'Alt', 'Ctrl',
        'Shift', 'CapsLock', 'NumLock', 'ScrollLock'
      ];
      
      if (navigationKeys.includes(key)) return;
      
      // Vérifier si on est dans un élément actif (input, etc.)
      if (isElementActive(activeElement)) {
        return;
      }
      
      // Vérifier si on est dans une modal
      if (isInModal()) {
        return;
      }
      
      // Vérifier si on est dans la navbar
      if (isInNavbar(activeElement)) {
        return;
      }
      
      // Si c'est un chiffre, l'ajouter au buffer
      if (key.length === 1 && /^\d$/.test(key)) {
        barcodeBufferRef.current += key;
        
        // Réinitialiser le timeout existant
        if (barcodeTimeoutRef.current) {
          clearTimeout(barcodeTimeoutRef.current);
        }
        
        // Nouveau timeout pour traiter le code-barres
        barcodeTimeoutRef.current = setTimeout(() => {
          const barcode = barcodeBufferRef.current;
          if (barcode && barcode.length > 0) {
            if (isValidBarcode(barcode)) {
              processBarcode(barcode);
            } else {
              console.log('[useBarcodeScanner] Code-barres invalide (global):', barcode);
            }
            // Réinitialiser le buffer
            barcodeBufferRef.current = '';
          }
          barcodeTimeoutRef.current = null;
        }, 200);
      }
      
      // Si c'est Enter, traiter le code-barres
      if (key === 'Enter') {
        const barcode = barcodeBufferRef.current;
        if (barcode && barcode.length > 0) {
          if (isValidBarcode(barcode)) {
            processBarcode(barcode);
          } else {
            console.log('[useBarcodeScanner] Code-barres invalide (Enter):', barcode);
          }
          // Réinitialiser le buffer
          barcodeBufferRef.current = '';
        }
        // Nettoyer le timeout
        if (barcodeTimeoutRef.current) {
          clearTimeout(barcodeTimeoutRef.current);
          barcodeTimeoutRef.current = null;
        }
      }
    };

    if (isActive) {
      document.addEventListener('keydown', handleGlobalKeyDown);
      return () => {
        document.removeEventListener('keydown', handleGlobalKeyDown);
      };
    }
  }, [isActive, isValidBarcode, processBarcode, isElementActive, isInModal, isInNavbar]);

  // Focus initial seulement
  useEffect(() => {
    if (isActive && containerRef.current) {
      containerRef.current.focus();
    }
  }, [isActive]);

  // Nettoyage des timeouts
  useEffect(() => {
    return () => {
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    handleKeyDown,
    isProcessing: isProcessingRef.current
  };
};

export default useBarcodeScanner;
