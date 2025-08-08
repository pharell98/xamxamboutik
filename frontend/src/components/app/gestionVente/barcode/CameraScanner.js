import React, { useEffect, useRef } from 'react';
import Quagga from 'quagga';

const CameraScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const lastScanRef = useRef(null);
  const isInitializedRef = useRef(false);
  const isProcessingRef = useRef(false);
  const scanTimeoutRef = useRef(null);

  useEffect(() => {
    if (isInitializedRef.current) {
      return;
    }

    Quagga.init(
      {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: videoRef.current,
          constraints: {
            facingMode: 'environment',
            width: 640,
            height: 480
          }
        },
        decoder: {
          readers: ['ean_reader'], // Limiter à EAN-13 uniquement
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
      },
      err => {
        if (err) {
          console.error("Échec de l'initialisation de Quagga:", err);
          return;
        }
        Quagga.start();
        isInitializedRef.current = true;
        console.log('[CameraScanner] Scanner caméra initialisé');
      }
    );

    Quagga.onProcessed(result => {
      if (result && result.boxes && result.boxes.length > 0) {
        // Optionnel : afficher des informations de debug
      }
    });

    Quagga.onDetected(result => {
      if (isProcessingRef.current) {
        console.log('[CameraScanner] Scan ignoré - traitement en cours');
        return;
      }

      const code = result.codeResult.code;
      const now = Date.now();
      
      // Vérifier si c'est le même code récemment scanné
      if (lastScanRef.current === code) {
        console.log('[CameraScanner] Code déjà scanné récemment:', code);
        return;
      }

      // Validation du code-barres
      if (!code || code.length !== 13 || !/^\d{13}$/.test(code)) {
        console.log('[CameraScanner] Code invalide:', code);
        return;
      }

      console.log('[CameraScanner] Code détecté:', code);
      
      isProcessingRef.current = true;
      lastScanRef.current = code;
      
      // Appeler la fonction de callback
      onScan(code);
      
      // Réinitialiser après un délai pour éviter les scans multiples
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      
      scanTimeoutRef.current = setTimeout(() => {
        lastScanRef.current = null;
        isProcessingRef.current = false;
        console.log('[CameraScanner] Scanner réinitialisé');
      }, 3000); // 3 secondes de délai
    });

    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      Quagga.stop();
      isInitializedRef.current = false;
      isProcessingRef.current = false;
      lastScanRef.current = null;
      console.log('[CameraScanner] Scanner arrêté');
    };
  }, [onScan]);

  return (
    <div className="border rounded-1 overflow-hidden position-relative">
      <div ref={videoRef} style={{ width: '100%', height: '200px' }} />
      
      {/* Indicateur de statut */}
      <div 
        className="position-absolute top-0 start-0 m-2"
        style={{
          fontSize: '10px',
          color: '#fff',
          padding: '2px 6px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '3px',
          zIndex: 10
        }}
      >
        Scanner caméra actif
      </div>
      
      {/* Overlay pour indiquer la zone de scan */}
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
    </div>
  );
};

export default CameraScanner;
