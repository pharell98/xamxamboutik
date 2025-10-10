import React, { useEffect, useRef, useCallback, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

// Constants
const SCAN_DELAY = 3000;

const CameraScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const targetIdRef = useRef('camera-scanner-target');
  const scanStateRef = useRef({
    lastScan: null,
    isProcessing: false,
    isInitialized: false,
    timeoutId: null,
    hasError: false
  });
  const codeReaderRef = useRef(null);
  const zxingVideoRef = useRef(null);
  const [needsPermission, setNeedsPermission] = useState(true);

  // Validate codes with different lengths (6-32 characters, alphanumeric + symbols)
  const isValidCode = useCallback(code => {
    if (typeof code !== 'string') return false;
    const cleanCode = code.trim();
    return (
      /^[a-zA-Z0-9\-_\s]+$/.test(cleanCode) &&
      cleanCode.length >= 6 &&
      cleanCode.length <= 32
    );
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

  // Handle detected code
  const handleDetection = useCallback(
    result => {
      const state = scanStateRef.current;

      if (state.isProcessing) return;

      const code = result.codeResult.code;

      if (!isValidCode(code) || state.lastScan === code) return;

      state.isProcessing = true;
      state.lastScan = code;

      onScan(code);

      state.timeoutId = setTimeout(resetScanState, SCAN_DELAY);
    },
    [onScan, isValidCode, resetScanState]
  );

  // Initialize ZXing scanner
  const startZxing = useCallback(async () => {
    const state = scanStateRef.current;
    try {
      if (!zxingVideoRef.current) {
        throw new Error('Video element not found');
      }

      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }
      const codeReader = codeReaderRef.current;

      const devices = await codeReader.listVideoInputDevices();
      if (!devices?.length) {
        throw new Error('No camera available');
      }

      // Prefer back/environment camera
      const preferred =
        devices.find(d => /back|rear|environment/i.test(d.label)) || devices[0];

      await codeReader.decodeFromVideoDevice(
        preferred.deviceId,
        zxingVideoRef.current,
        result => {
          if (result?.getText) {
            const text = result.getText();
            if (text) {
              handleDetection({ codeResult: { code: text } });
            }
          }
        }
      );

      state.isInitialized = true;
      state.hasError = false;
      setNeedsPermission(false);
    } catch (err) {
      state.hasError = true;
      setNeedsPermission(true);
    }
  }, [handleDetection]);

  // Initialize when component mounts
  useEffect(() => {
    const state = scanStateRef.current;

    if (state.isInitialized) return;

    const cleanup = () => {
      try {
        resetScanState();

        if (codeReaderRef.current) {
          codeReaderRef.current.reset();
        }

        state.isInitialized = false;
      } catch (_) {}
    };

    return cleanup;
  }, [resetScanState]);

  const state = scanStateRef.current;

  return (
    <div className="border rounded-1 overflow-hidden position-relative">
      <div
        id={targetIdRef.current}
        ref={videoRef}
        style={{ width: '100%', height: '200px', position: 'relative' }}
      >
        <video
          id={`${targetIdRef.current}-video`}
          ref={zxingVideoRef}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          muted
          playsInline
          autoPlay
        />
        {needsPermission && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
            style={{
              backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 20,
              color: 'white',
              textAlign: 'center',
              padding: '20px'
            }}
          >
            <i className="fas fa-video mb-3" style={{ fontSize: '32px' }} />
            <div className="mb-3">
              <div className="fw-bold mb-1">Accès caméra requis</div>
              <small>Pour scanner les codes QR/barres</small>
            </div>
            <button
              className="btn btn-sm btn-primary mb-2"
              onClick={startZxing}
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
                      const stream = await navigator.mediaDevices.getUserMedia({
                        video: true
                      });
                      if (zxingVideoRef.current) {
                        zxingVideoRef.current.srcObject = stream;
                      }
                      setNeedsPermission(false);
                    } catch (err) {
                      alert(
                        `Erreur caméra: ${err.message}\n\nVérifiez :\n- Préférences Système > Confidentialité > Caméra\n- Paramètres navigateur`
                      );
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
          backgroundColor: state.hasError
            ? 'rgba(220, 53, 69, 0.8)'
            : 'rgba(0, 0, 0, 0.7)',
          borderRadius: '3px',
          zIndex: 10
        }}
      >
        {state.hasError
          ? 'Erreur caméra'
          : state.isInitialized
          ? 'Scanner caméra actif'
          : needsPermission
          ? 'Autorisation requise'
          : 'Initialisation...'}
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
            <i
              className="fas fa-exclamation-triangle mb-2"
              style={{ fontSize: '24px' }}
            />
            <div className="mb-2">Scanner caméra indisponible</div>
            <small className="d-block mb-3">Utilisez le scanner USB</small>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => {
                const state = scanStateRef.current;
                state.hasError = false;
                setNeedsPermission(true);
              }}
            >
              <i className="fas fa-redo me-1" />
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Scan area overlay */}
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
