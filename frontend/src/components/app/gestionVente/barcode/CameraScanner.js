import React, { useEffect, useRef, useCallback, useState } from 'react';
import Quagga from 'quagga';
import { BrowserMultiFormatReader } from '@zxing/library';

// Constants
const QUAGGA_CONFIG = {
  inputStream: {
    name: 'Live',
    type: 'LiveStream',
    constraints: {
      facingMode: 'environment',
      width: 640,
      height: 480
    }
  },
  decoder: {
    readers: ['ean_reader'],
    multiple: false
  },
  locator: {
    patchSize: 'medium',
    halfSample: true
  },
  numOfWorkers: navigator.hardwareConcurrency || 4,
  frequency: 10,
  locate: true,
  debug: {
    drawBoundingBox: false,
    showFrequency: false,
    drawScanline: false,
    showPattern: false
  }
};

const SCAN_DELAY = 3000; // 3 seconds
const BARCODE_LENGTH = 13; // conservé pour compat EAN, mais on accepte aussi les QR
// Feature flag: use Quagga or directly fallback to ZXing
const USE_QUAGGA = false;

const CameraScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  // Utiliser un ID stable pour l'élément cible de Quagga
  const targetIdRef = useRef(`camera-scanner-target`);
  const scanStateRef = useRef({
    lastScan: null,
    isProcessing: false,
    isInitialized: false,
    timeoutId: null,
    hasError: false,
    observer: null,
    startTimeout: null,
    safetyTimeout: null,
    useZxing: false
  });
  const codeReaderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const zxingVideoRef = useRef(null);
  const [needsPermission, setNeedsPermission] = useState(true);

  // Validate code: accepter QR ou EAN. On laisse l'API déterminer la validité.
  const isValidBarcode = useCallback((code) => {
    return typeof code === 'string' && code.trim().length > 0;
  }, []);

  // Reset scan state
  const resetScanState = useCallback(() => {
    const state = scanStateRef.current;
    state.lastScan = null;
    state.isProcessing = false;
    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
      state.timeoutId = null;
    }
  }, []);

  // Handle detected barcode
  const handleDetection = useCallback((result) => {
    const state = scanStateRef.current;
    
    if (state.isProcessing) return;

    const code = result.codeResult.code;
    
    // Validate and check for duplicates
    if (!isValidBarcode(code) || state.lastScan === code) return;

    // Process scan
    state.isProcessing = true;
    state.lastScan = code;
    
    onScan(code);
    
    // Reset after delay
    state.timeoutId = setTimeout(resetScanState, SCAN_DELAY);
  }, [onScan, isValidBarcode, resetScanState]);

  // ZXing fallback starter
  const startZxing = useCallback(async () => {
    const state = scanStateRef.current;
    try {
      if (!zxingVideoRef.current) {
        // S'assurer que la balise video est présente
        throw new Error('Élément <video> ZXing introuvable');
      }
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }
      const codeReader = codeReaderRef.current;

      // Get available video input devices (instance method)
      const devices = await codeReader.listVideoInputDevices();
      if (!devices || devices.length === 0) {
        throw new Error('Aucune caméra disponible');
      }
      // Prefer back/environment camera when possible
      const preferred = devices.find(d => /back|rear|environment/i.test(d.label)) || devices[0];

      await codeReader.decodeFromVideoDevice(
        preferred.deviceId,
        zxingVideoRef.current,
        (result, err) => {
          if (result && result.getText) {
            const text = result.getText();
            if (text) {
              handleDetection({ codeResult: { code: text } });
            }
          }
        }
      );

      state.isInitialized = true;
      state.hasError = false;
      state.useZxing = true;
      console.log('[CameraScanner] ZXing initialisé avec succès');
      setNeedsPermission(false);
    } catch (err) {
      console.error('[CameraScanner] ZXing échec initialisation:', err);
      state.hasError = true;
      // Permission refusée ou bloquée
      setNeedsPermission(true);
    }
  }, [handleDetection]);

  // Initialize Quagga with IntersectionObserver approach
  useEffect(() => {
    const state = scanStateRef.current;
    
    if (state.isInitialized) return;

    // Utiliser IntersectionObserver pour détecter quand l'élément est vraiment visible
    const initializeWhenReady = () => {
      if (!videoRef.current) {
        console.warn('[CameraScanner] Élément video non disponible');
        state.hasError = true;
        return;
      }

      // Créer un observer pour détecter quand l'élément devient visible
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && entry.target.offsetWidth > 0 && entry.target.offsetHeight > 0) {
            console.log('[CameraScanner] Élément video maintenant visible, initialisation...');
            
            // Arrêter l'observation
            observer.disconnect();
            
            // Attendre un peu plus pour être sûr
            setTimeout(() => {
              try {
                if (!USE_QUAGGA) {
                  console.log('[CameraScanner] Quagga désactivé - attendre autorisation utilisateur');
                  // On n'auto-démarre pas ZXing ici pour éviter NotAllowedError, on attend un geste utilisateur
                  return;
                }
                // Résoudre explicitement l'élément cible DOM
                const targetElement = (videoRef.current && videoRef.current.nodeType === 1)
                  ? videoRef.current
                  : document.getElementById(targetIdRef.current);

                if (!targetElement) {
                  console.error('[CameraScanner] Élément cible introuvable pour Quagga');
                   state.hasError = true;
                   // Fallback ZXing (sera déclenché par un geste utilisateur)
                  return;
                }

                const config = {
                  ...QUAGGA_CONFIG,
                  inputStream: {
                    ...QUAGGA_CONFIG.inputStream,
                    // IMPORTANT: Quagga 0.6.x attend un élément DOM, pas un sélecteur
                    target: targetElement
                  }
                };

                console.log('[CameraScanner] Initialisation de Quagga avec élément visible...');
                
                Quagga.init(config, (err) => {
                  if (err) {
                    console.error("[CameraScanner] Échec de l'initialisation de Quagga:", err);
                    state.hasError = true;
                    // Fallback vers ZXing
                    startZxing();
                    return;
                  }
                  
                  try {
                    Quagga.start();
                    state.isInitialized = true;
                    state.hasError = false;
                    console.log('[CameraScanner] Scanner caméra initialisé avec succès');
                  } catch (startError) {
                    console.error('[CameraScanner] Erreur lors du démarrage:', startError);
                    state.hasError = true;
                    // Fallback ZXing (sera déclenché par un geste utilisateur)
                  }
                });

                Quagga.onDetected(handleDetection);
              } catch (initError) {
                console.error('[CameraScanner] Erreur lors de l\'initialisation:', initError);
                state.hasError = true;
                // Fallback ZXing (sera déclenché par un geste utilisateur)
              }
            }, 200);
          }
        },
        { 
          threshold: 0.1,
          rootMargin: '10px'
        }
      );

      // Commencer l'observation
      observer.observe(videoRef.current);
      
      // Stocker l'observer pour le cleanup
      state.observer = observer;

      // Timeout de sécurité
      const safetyTimeout = setTimeout(() => {
        if (!state.isInitialized) {
          console.error('[CameraScanner] Timeout - initialisation forcée');
          observer.disconnect();
          state.hasError = true;
        }
      }, 5000); // 5 secondes max

      state.safetyTimeout = safetyTimeout;
    };

    // Démarrer l'initialisation avec un délai minimal
    const startTimeout = setTimeout(initializeWhenReady, 50);
    state.startTimeout = startTimeout;

    return () => {
      // Cleanup de tous les timeouts et observers
      if (state.startTimeout) {
        clearTimeout(state.startTimeout);
        state.startTimeout = null;
      }
      
      if (state.safetyTimeout) {
        clearTimeout(state.safetyTimeout);
        state.safetyTimeout = null;
      }
      
      if (state.observer) {
        state.observer.disconnect();
        state.observer = null;
      }
      
      try {
        resetScanState();
        // Nettoyer le listener Quagga s'il a été ajouté
        try {
          Quagga.offDetected(handleDetection);
        } catch (_) {
          // ignore si non attaché
        }
        if (state.isInitialized) {
          try { Quagga.stop(); } catch (_) {}
        }
        // Stop ZXing if used
        try {
          if (codeReaderRef.current) {
            codeReaderRef.current.reset();
          }
        } catch (_) {}
        if (mediaStreamRef.current) {
          try {
            mediaStreamRef.current.getTracks().forEach(t => t.stop());
          } catch (_) {}
          mediaStreamRef.current = null;
        }
        state.isInitialized = false;
        console.log('[CameraScanner] Scanner caméra arrêté');
      } catch (stopError) {
        console.error('[CameraScanner] Erreur lors de l\'arrêt:', stopError);
      }
    };
  }, [handleDetection, resetScanState, startZxing]);

  const state = scanStateRef.current;

  return (
    <div className="border rounded-1 overflow-hidden position-relative">
      <div id={targetIdRef.current} ref={videoRef} style={{ width: '100%', height: '200px', position: 'relative' }}>
        <video
          id={`${targetIdRef.current}-video`}
          ref={zxingVideoRef}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          muted
          playsInline
          autoPlay
        />
        {needsPermission && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 20, color: 'white', textAlign: 'center', padding: '20px' }}>
            <i className="fas fa-video mb-3" style={{ fontSize: '32px' }} />
            <div className="mb-3">
              <div className="fw-bold mb-1">Accès caméra requis</div>
              <small>Pour scanner les codes QR/barres</small>
            </div>
            <button
              className="btn btn-sm btn-primary mb-2"
              onClick={async () => {
                try {
                  console.log('[CameraScanner] Tentative d\'activation de la caméra...');
                  await startZxing();
                } catch (e) {
                  console.error('[CameraScanner] Erreur lors de l\'activation:', e);
                }
              }}
            >
              <i className="fas fa-camera me-1" />
              Activer la caméra
            </button>
            <div className="mt-2">
              <small className="text-light">
                💡 Si bloqué, vérifiez les paramètres de votre navigateur
              </small>
              <div className="mt-2">
                <button 
                  className="btn btn-sm btn-outline-light"
                  onClick={async () => {
                    try {
                      console.log('[CameraScanner] Test direct getUserMedia...');
                      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                      console.log('✅ Test réussi !', stream);
                      // Afficher le stream directement
                      if (zxingVideoRef.current) {
                        zxingVideoRef.current.srcObject = stream;
                      }
                      setNeedsPermission(false);
                    } catch (err) {
                      console.error('❌ Test échoué:', err.name, err.message);
                      alert(`Erreur caméra: ${err.message}\n\nVérifiez :\n- Préférences Système > Confidentialité > Caméra\n- Paramètres navigateur`);
                    }
                  }}
                >
                  🧪 Test direct
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Status indicator */}
      <div 
        className="position-absolute top-0 start-0 m-2"
        style={{
          fontSize: '10px',
          color: '#fff',
          padding: '2px 6px',
          backgroundColor: state.hasError ? 'rgba(220, 53, 69, 0.8)' : 'rgba(0, 0, 0, 0.7)',
          borderRadius: '3px',
          zIndex: 10
        }}
      >
        {state.hasError ? 'Erreur caméra' : 
         state.isInitialized ? 'Scanner caméra actif' : (needsPermission ? 'Autorisation requise' : 'Initialisation...')}
      </div>
      
      {/* Error message */}
      {state.hasError && (
        <div 
          className="position-absolute d-flex align-items-center justify-content-center"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(248, 249, 250, 0.9)',
            color: '#6c757d',
            fontSize: '14px',
            textAlign: 'center',
            padding: '20px',
            zIndex: 5
          }}
        >
          <div>
            <i className="fas fa-exclamation-triangle mb-2" style={{ fontSize: '24px' }} />
            <div className="mb-2">Scanner caméra indisponible</div>
            <small className="d-block mb-3">Utilisez le scanner USB</small>
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={() => {
                // Reset de l'état et tenter une réinitialisation douce
                state.hasError = false;
                if (state.observer) {
                  state.observer.disconnect();
                  state.observer = null;
                }
                // Relancer l'initialisation en simulant un nouveau montage léger
                setTimeout(() => {
                  const event = new Event('resize');
                  window.dispatchEvent(event);
                }, 50);
              }}
            >
              <i className="fas fa-redo me-1" />
              Réessayer
            </button>
          </div>
        </div>
      )}
      
      {/* Scan area overlay - only show when working */}
      {!state.hasError && state.isInitialized && (
        <div 
          className="position-absolute"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '200px',
            height: '100px',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 5
          }}
        />
      )}
    </div>
  );
};

export default CameraScanner;