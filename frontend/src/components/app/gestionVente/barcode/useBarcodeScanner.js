import { useCallback, useEffect, useRef } from 'react';

// Constants
const SCAN_COOLDOWN = 1000;
const BARCODE_TIMEOUT = 200;
const PROCESSING_RESET_DELAY = 1000;
const MIN_BARCODE_LENGTH = 9;
const MAX_BARCODE_LENGTH = 13;
const DUPLICATE_PREVENTION_TIME = 2000;

const NAVIGATION_KEYS = [
  'Tab',
  'Escape',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'Meta',
  'Alt',
  'Ctrl',
  'Shift',
  'CapsLock',
  'NumLock',
  'ScrollLock',
  ...Array.from({ length: 12 }, (_, i) => `F${i + 1}`)
];

const BLOCKED_SELECTORS = [
  '.cart-section',
  '.cart-item',
  '.quantity-controller',
  '.price-wrapper',
  '.modal',
  '[role="dialog"]',
  '.popover',
  '.dropdown-menu',
  '.navbar',
  '.nav',
  '.sidebar',
  '.navbar-vertical',
  '.navbar-top'
];

const INPUT_TYPES = [
  'text',
  'number',
  'tel',
  'email',
  'password',
  'search',
  'url'
];

/**
 * Hook pour gérer le scanner de code-barres USB
 * @param {Function} onScan - Callback appelé lors d'un scan valide
 * @param {boolean} isActive - État d'activation du scanner
 */
const useBarcodeScanner = (onScan, isActive = true) => {
  const containerRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const isProcessingRef = useRef(false);
  const barcodeBufferRef = useRef('');
  const barcodeTimeoutRef = useRef(null);

  // Utilitaires de validation
  const isValidBarcode = useCallback(code => {
    const cleanCode = code.trim();
    return /^[a-zA-Z0-9\-_\s]+$/.test(cleanCode) && 
           cleanCode.length >= MIN_BARCODE_LENGTH && 
           cleanCode.length <= MAX_BARCODE_LENGTH;
  }, []);
  const isValidCharacter = useCallback(key => {
    // Accepter chiffres, lettres, tirets, underscores et espaces
    return key.length === 1 && /^[a-zA-Z0-9\-_\s]$/.test(key);
  }, []);

  // Vérification des éléments actifs
  const isElementBlocked = useCallback(element => {
    if (!element) return false;

    // Éléments de saisie
    const isInputElement =
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName) ||
      element.contentEditable === 'true' ||
      INPUT_TYPES.includes(element.type);

    // Éléments interactifs
    const isInteractiveElement =
      ['BUTTON', 'A'].includes(element.tagName) ||
      ['button', 'link'].includes(element.role);

    // Conteneurs bloqués
    const isInBlockedContainer = BLOCKED_SELECTORS.some(selector =>
      element.closest(selector)
    );

    // Formulaires
    const isInForm = element.closest('form') !== null;

    return (
      isInputElement || isInteractiveElement || isInBlockedContainer || isInForm
    );
  }, []);

  // Traitement du code-barres
  const processBarcode = useCallback(
    async barcode => {
      if (isProcessingRef.current) return;

      isProcessingRef.current = true;
      lastScanTimeRef.current = Date.now();

      try {
        await onScan(barcode);
      } catch (error) {
        console.error('[useBarcodeScanner] Erreur lors du scan:', error);
      } finally {
        setTimeout(() => {
          isProcessingRef.current = false;
        }, PROCESSING_RESET_DELAY);
      }
    },
    [onScan]
  );

  // Gestion du buffer et timeout
  const handleBarcodeInput = useCallback(
    key => {
      if (key === 'Enter') {
        const barcode = barcodeBufferRef.current.trim();
        if (barcode && isValidBarcode(barcode)) {
          processBarcode(barcode);
        }
        barcodeBufferRef.current = '';
        if (barcodeTimeoutRef.current) {
          clearTimeout(barcodeTimeoutRef.current);
          barcodeTimeoutRef.current = null;
        }
      } else if (isValidCharacter(key)) {
        barcodeBufferRef.current += key;

        if (barcodeTimeoutRef.current) {
          clearTimeout(barcodeTimeoutRef.current);
        }

        // Traitement automatique quand on atteint la longueur maximale
        const currentLength = barcodeBufferRef.current.length;
        if (currentLength >= MAX_BARCODE_LENGTH) {
          const barcode = barcodeBufferRef.current;
          if (isValidBarcode(barcode)) {
            processBarcode(barcode);
            barcodeBufferRef.current = '';
            if (barcodeTimeoutRef.current) {
              clearTimeout(barcodeTimeoutRef.current);
              barcodeTimeoutRef.current = null;
            }
            return;
          }
        }

        barcodeTimeoutRef.current = setTimeout(() => {
          const barcode = barcodeBufferRef.current.trim();
          if (barcode && isValidBarcode(barcode)) {
            processBarcode(barcode);
          }
          barcodeBufferRef.current = '';
          barcodeTimeoutRef.current = null;
        }, BARCODE_TIMEOUT);
      }
    },
    [isValidBarcode, processBarcode, isValidCharacter]
  );

  // Gestionnaire d'événements clavier principal
  const handleKeyDown = useCallback(
    event => {
      if (!isActive) return;

      const { key } = event;
      const now = Date.now();

      // Cooldown entre scans
      if (now - lastScanTimeRef.current < SCAN_COOLDOWN) return;

      // Touches de navigation
      if (NAVIGATION_KEYS.includes(key)) return;

      // Éléments bloqués
      const activeElement = document.activeElement;
      if (
        isElementBlocked(activeElement) &&
        activeElement !== containerRef.current
      ) {
        return;
      }

      handleBarcodeInput(key);
    },
    [isActive, isElementBlocked, handleBarcodeInput]
  );

  // Gestionnaire global pour capturer les scans USB
  useEffect(() => {
    if (!isActive) return;

    const handleGlobalKeyDown = event => {
      if (isProcessingRef.current) return;

      const { key } = event;
      const activeElement = document.activeElement;

      // Éviter la duplication avec le gestionnaire local
      if (activeElement === containerRef.current) return;

      // Vérifications de base
      if (NAVIGATION_KEYS.includes(key) || isElementBlocked(activeElement))
        return;

      handleBarcodeInput(key);
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isActive, isElementBlocked, handleBarcodeInput]);

  // Focus initial
  useEffect(() => {
    if (isActive && containerRef.current) {
      containerRef.current.focus();
    }
  }, [isActive]);

  // Nettoyage
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
