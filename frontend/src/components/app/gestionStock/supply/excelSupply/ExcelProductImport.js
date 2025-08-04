import React, { useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import ExcelImporter from './ExcelImport';
import ExcelViewer from './ExcelViewer';
import ExcelEditor from './ExcelEditor';
import useExcelProductImport from './hook/useExcelProductImport';
import { useAppContext } from '../../../../../providers/AppProvider';
import { getColor } from '../../../../../helpers/utils';

const ExcelProductImport = ({ onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { config } = useAppContext();
  const { 
    data, 
    modifiedData, 
    loading, 
    handleDataUpload, 
    sendToBackend, 
    setData, 
    updateModifiedData 
  } = useExcelProductImport({
    onImportSuccess: () => onClose() // Appeler onClose après un import réussi
  });

  const handleImport = async () => {
    const success = await sendToBackend();
    if (success) {
      setIsEditing(false);
    }
  };

  // Utiliser les données modifiées si disponibles, sinon les données originales
  const displayData = modifiedData.length > 0 ? modifiedData : data;

  // Couleurs adaptatives basées sur le thème
  const isDark = config.isDark;
  const primaryColor = getColor('primary') || '#2c7be5';
  const backgroundColor = isDark ? '#2a2d35' : '#ffffff';
  const cardBackground = isDark ? '#343a40' : '#ffffff';
  const borderColor = isDark ? '#495057' : '#dee2e6';
  const textColor = isDark ? '#e9ecef' : '#212529';
  const headerBackground = isDark 
    ? 'linear-gradient(135deg, #3a3f4b 0%, #2a2d35 100%)'
    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';

  return (
    <Card 
      className="mb-3 shadow-sm" 
      style={{ 
        borderRadius: '12px',
        background: cardBackground,
        border: `1px solid ${borderColor}`,
        boxShadow: isDark 
          ? '0 8px 24px rgba(0, 0, 0, 0.4)'
          : '0 8px 24px rgba(0, 0, 0, 0.15)'
      }}
    >
      <Card.Header
        className="d-flex justify-content-between align-items-center py-3"
        style={{ 
          fontSize: '18px', 
          fontWeight: '600',
          background: headerBackground,
          color: isDark ? '#ffffff' : '#495057',
          borderBottom: `1px solid ${borderColor}`,
          borderRadius: '12px 12px 0 0'
        }}
      >
        <span style={{ color: isDark ? '#ffffff' : '#495057' }}>
          Importation de Produits via Excel
        </span>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={onClose}
          style={{ 
            padding: '8px 16px',
            borderRadius: '8px',
            borderColor: isDark ? '#495057' : '#6c757d',
            color: isDark ? '#e9ecef' : '#6c757d',
            background: 'transparent'
          }}
        >
          Retour
        </Button>
      </Card.Header>
      <Card.Body style={{ 
        padding: '24px', 
        position: 'relative',
        background: backgroundColor,
        borderRadius: '0 0 12px 12px'
      }}>
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: isDark 
                ? 'rgba(42, 45, 53, 0.9)'
                : 'rgba(255, 255, 255, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
              borderRadius: '0 0 12px 12px'
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
                    background: primaryColor,
                    animation: 'wave 1.2s infinite ease-in-out',
                    animationDelay: `${idx * 0.1}s`,
                    borderRadius: '2px'
                  }}
                />
              ))}
            </div>
            <p
              style={{ 
                marginTop: '16px', 
                fontSize: '16px', 
                color: primaryColor,
                fontWeight: '500'
              }}
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
        {displayData.length === 0 && !loading && (
          <ExcelImporter onData={handleDataUpload} />
        )}
        <div className="mb-4">
          {isEditing ? (
            <ExcelEditor
              initialData={displayData}
              onDataChange={updatedData => {
                updateModifiedData(updatedData); // Mettre à jour les données modifiées
                setIsEditing(false);
              }}
            />
          ) : (
            <ExcelViewer data={displayData} />
          )}
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <Button
            variant="outline-primary"
            onClick={() => setIsEditing(!isEditing)}
            disabled={displayData.length === 0 || loading}
            style={{ 
              padding: '10px 20px', 
              fontSize: '14px',
              borderRadius: '8px',
              borderColor: primaryColor,
              color: primaryColor,
              background: 'transparent'
            }}
          >
            {isEditing ? 'Annuler' : 'Modifier les données'}
          </Button>
          {displayData.length > 0 && (
            <Button
              onClick={handleImport}
              disabled={loading}
              style={{ 
                padding: '10px 20px', 
                fontSize: '14px',
                borderRadius: '8px',
                background: primaryColor,
                borderColor: primaryColor,
                boxShadow: '0 4px 12px rgba(44, 123, 229, 0.3)'
              }}
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
