import React, { useEffect, useRef } from 'react';
import Quagga from 'quagga';

const CameraScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const lastScanRef = useRef(null);
  const isInitializedRef = useRef(false);
  const isProcessingRef = useRef(false); // Ajouté pour bloquer les scans multiples

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
      }
    );

    Quagga.onProcessed(result => {
      if (result && result.boxes && result.boxes.length > 0) {
        }
    });

    Quagga.onDetected(result => {
      if (isProcessingRef.current) {
        return;
      }

      const code = result.codeResult.code;
      if (lastScanRef.current !== code) {
        isProcessingRef.current = true; // Bloquer les nouveaux scans
        lastScanRef.current = code;
        onScan(code);
        setTimeout(() => {
          lastScanRef.current = null;
          isProcessingRef.current = false; // Réinitialiser après 2s
        }, 2000); // Augmenté à 2s pour donner assez de temps à la requête
      }
    });

    return () => {
      Quagga.stop();
      isInitializedRef.current = false;
      isProcessingRef.current = false;
    };
  }, [onScan]);

  return (
    <div className="border rounded-1 overflow-hidden">
      <div ref={videoRef} style={{ width: '100%', height: '200px' }} />
    </div>
  );
};

export default CameraScanner;
