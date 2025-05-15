import React, { useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import ExcelImporter from './ExcelImport';
import ExcelViewer from './ExcelViewer';
import ExcelEditor from './ExcelEditor';
import useExcelProductImport from './hook/useExcelProductImport';

const ExcelProductImport = ({ onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { data, loading, handleDataUpload, sendToBackend, setData } =
    useExcelProductImport({
      onImportSuccess: () => onClose() // Appeler onClose après un import réussi
    });

  const handleImport = async () => {
    const success = await sendToBackend();
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <Card className="mb-3 shadow-sm" style={{ borderRadius: '8px' }}>
      <Card.Header
        className="bg-body-tertiary d-flex justify-content-between align-items-center py-3"
        style={{ fontSize: '18px', fontWeight: '600' }}
      >
        <span>Importation de Produits via Excel</span>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={onClose}
          style={{ padding: '6px 12px' }}
        >
          Retour
        </Button>
      </Card.Header>
      <Card.Body style={{ padding: '20px', position: 'relative' }}>
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '10px',
                height: '50px'
              }}
            >
              {[...Array(5)].map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '10px',
                    height: '100%',
                    background: '#007bff',
                    animation: 'wave 1.2s infinite ease-in-out',
                    animationDelay: `${idx * 0.1}s`,
                    borderRadius: '2px'
                  }}
                />
              ))}
            </div>
            <p
              style={{ marginTop: '10px', fontSize: '16px', color: '#007bff' }}
            >
              Chargement des produits...
            </p>
            <style>
              {`
                @keyframes wave {
                  0%, 100% {
                    transform: scaleY(0.2);
                  }
                  50% {
                    transform: scaleY(1);
                  }
                }
              `}
            </style>
          </div>
        )}
        {data.length === 0 && !loading && (
          <ExcelImporter onData={handleDataUpload} />
        )}
        <div className="mb-4">
          {isEditing ? (
            <ExcelEditor
              initialData={data}
              onDataChange={updatedData => {
                setData(updatedData);
                setIsEditing(false);
              }}
            />
          ) : (
            <ExcelViewer data={data} />
          )}
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <Button
            variant="outline-primary"
            onClick={() => setIsEditing(!isEditing)}
            disabled={data.length === 0 || loading}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            {isEditing ? 'Annuler' : 'Modifier les données'}
          </Button>
          {data.length > 0 && (
            <Button
              onClick={handleImport}
              disabled={loading}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Valider l'importation
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default React.memo(ExcelProductImport);
