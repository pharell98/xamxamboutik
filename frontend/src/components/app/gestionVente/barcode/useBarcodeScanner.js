import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook personnalisé pour gérer les événements clavier du scanner de code-barres
 * Évite les interférences avec d'autres éléments de l'interface
 */
const useBarcodeScanner = (onScan, isActive = true) => {
  const barcodeRef = useRef('');
  const isProcessingRef = useRef(false);
  const lastScanTimeRef = useRef(0);
  const containerRef = useRef(null);
  const focusTimeoutRef = useRef(null);

  // Fonction pour vérifier si un élément est actif et peut recevoir des entrées
  const isElementActive = useCallback((element) => {
    if (!element) return false;
    
    // Vérifier si l'élément est un input, textarea, ou contenteditable
    const isInput = element.tagName === 'INPUT' || 
                   element.tagName === 'TEXTAREA' || 
                   element.contentEditable === 'true';
    
    // Vérifier si l'élément est focusable et actif
    const isFocusable = element.tabIndex >= 0 || 
                       element.tagName === 'BUTTON' || 
                       element.tagName === 'A' ||
                       isInput;
    
    return isFocusable && document.activeElement === element;
  }, []);

  // Fonction pour vérifier si on est dans un modal ou popup
  const isInModal = useCallback(() => {
    const modals = document.querySelectorAll('.modal.show, .popover.show, .dropdown.show');
    return modals.length > 0;
  }, []);

  // Fonction pour vérifier si l'élément actif est dans la navbar
  const isInNavbar = useCallback((element) => {
    if (!element) return false;
    
    // Vérifier si l'élément est dans la navbar
    const navbar = element.closest('.navbar, .navbar-vertical, .navbar-top');
    if (navbar) {
      console.log('[useBarcodeScanner] Élément dans la navbar détecté:', element);
      return true;
    }
    
    // Vérifier spécifiquement les boutons de toggle
    const isToggleButton = element.closest('.toggle-icon-wrapper, .navbar-toggler-humburger-icon, .navbar-vertical-toggle');
    if (isToggleButton) {
      console.log('[useBarcodeScanner] Bouton toggle détecté:', element);
      return true;
    }
    
    return false;
  }, []);

  // Fonction pour valider un code-barres
  const isValidBarcode = useCallback((barcode) => {
    return /^\d{13}$/.test(barcode);
  }, []);

  // Fonction pour refocuser le scanner
  const refocusScanner = useCallback(() => {
    if (isActive && containerRef.current) {
      // Délai pour éviter les conflits avec les clics de souris
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
      focusTimeoutRef.current = setTimeout(() => {
        if (isActive && containerRef.current) {
          containerRef.current.focus();
          console.log('[useBarcodeScanner] Scanner refocusé');
        }
      }, 100);
    }
  }, [isActive]);

  // Gestionnaire d'événements clavier
  const handleKeyDown = useCallback(async (event) => {
    if (!isActive) return;

    const now = Date.now();
    const key = event.key;

    // Éviter les scans multiples trop rapides
    if (now - lastScanTimeRef.current < 1000) {
      console.log('[useBarcodeScanner] Scan ignoré - trop rapide');
      return;
    }

    // Vérifier si un autre élément est actif
    const activeElement = document.activeElement;
    
    // Vérifier si l'élément actif est dans la navbar
    if (isInNavbar(activeElement)) {
      console.log('[useBarcodeScanner] Élément navbar actif, scan ignoré:', activeElement);
      return;
    }
    
    // Vérifier si un autre élément est actif (mais pas le scanner lui-même)
    if (isElementActive(activeElement) && activeElement !== containerRef.current) {
      console.log('[useBarcodeScanner] Élément actif détecté, scan ignoré:', activeElement);
      return;
    }

    // Vérifier si on est dans un modal
    if (isInModal()) {
      console.log('[useBarcodeScanner] Modal détecté, scan ignoré');
      return;
    }

    // Éviter les touches de navigation et les touches spéciales
    const navigationKeys = [
      'Tab', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 
      'Home', 'End', 'PageUp', 'PageDown', 'F1', 'F2', 'F3', 'F4', 'F5', 
      'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Meta', 'Alt', 'Ctrl',
      'Shift', 'CapsLock', 'NumLock', 'ScrollLock'
    ];
    if (navigationKeys.includes(key)) {
      return;
    }

    // Accepter les événements même si le focus n'est pas sur le conteneur
    // car le scanner USB peut envoyer des événements clavier directement

    if (key === 'Enter') {
      const code = barcodeRef.current;
      
      // Validation du code-barres
      if (!code || code.length === 0) {
        console.log('[useBarcodeScanner] Code vide, ignoré');
        return;
      }

      if (!isValidBarcode(code)) {
        console.log('[useBarcodeScanner] Code invalide:', code);
        barcodeRef.current = '';
        return;
      }

      // Éviter les traitements multiples
      if (isProcessingRef.current) {
        console.log('[useBarcodeScanner] Traitement en cours, ignoré');
        return;
      }

      isProcessingRef.current = true;
      lastScanTimeRef.current = now;
      const codeToProcess = code;
      barcodeRef.current = '';

      try {
        console.log('[useBarcodeScanner] Traitement du code:', codeToProcess);
        await onScan(codeToProcess);
      } catch (error) {
        console.error('[useBarcodeScanner] Erreur lors du traitement:', error);
      } finally {
        // Réinitialiser après un délai pour éviter les scans multiples
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 1000);
      }
    } else if (key.length === 1 && /^\d$/.test(key)) {
      // Accepter seulement les chiffres
      barcodeRef.current += key;
    }
  }, [isActive, isElementActive, isInModal, isInNavbar, isValidBarcode, onScan]);

  // Gestionnaire de perte de focus
  const handleBlur = useCallback(() => {
    console.log('[useBarcodeScanner] Scanner perdu le focus');
    // Refocuser automatiquement après un délai
    refocusScanner();
  }, [refocusScanner]);

  // Focus sur le conteneur quand le scanner est actif
  useEffect(() => {
    if (isActive && containerRef.current) {
      containerRef.current.focus();
    }
  }, [isActive]);

  // Écouter les événements de clic pour refocuser
  useEffect(() => {
    const handleDocumentClick = (event) => {
      // Si le clic n'est pas sur le scanner et qu'aucun élément actif n'est détecté
      if (isActive && 
          !containerRef.current?.contains(event.target) && 
          !isElementActive(event.target) && 
          !isInNavbar(event.target)) {
        refocusScanner();
      }
    };

    if (isActive) {
      document.addEventListener('click', handleDocumentClick);
      return () => {
        document.removeEventListener('click', handleDocumentClick);
      };
    }
  }, [isActive, isElementActive, isInNavbar, refocusScanner]);

  // Nettoyage des timeouts
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    handleKeyDown,
    handleBlur,
    isProcessing: isProcessingRef.current
  };
};

export default useBarcodeScanner;
