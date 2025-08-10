import React, { useEffect, useRef, useCallback } from 'react';
import Quagga from 'quagga';

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
const BARCODE_LENGTH = 13;

const CameraScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const scanStateRef = useRef({
    lastScan: null,
    isProcessing: false,
    isInitialized: false,
    timeoutId: null
  });

  // Validate barcode
  const isValidBarcode = useCallback((code) => {
    return code && code.length === BARCODE_LENGTH && /^\d{13}$/.test(code);
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

  // Initialize Quagga
  useEffect(() => {
    const state = scanStateRef.current;
    
    if (state.isInitialized) return;

    const config = {
      ...QUAGGA_CONFIG,
      inputStream: {
        ...QUAGGA_CONFIG.inputStream,
        target: videoRef.current
      }
    };

    Quagga.init(config, (err) => {
      if (err) {
        console.error("Échec de l'initialisation de Quagga:", err);
        return;
      }
      
      Quagga.start();
      state.isInitialized = true;
    });

    Quagga.onDetected(handleDetection);

    return () => {
      resetScanState();
      Quagga.stop();
      state.isInitialized = false;
    };
  }, [handleDetection, resetScanState]);

  return (
    <div className="border rounded-1 overflow-hidden position-relative">
      <div ref={videoRef} style={{ width: '100%', height: '200px' }} />
      
      {/* Status indicator */}
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
      
      {/* Scan area overlay */}
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