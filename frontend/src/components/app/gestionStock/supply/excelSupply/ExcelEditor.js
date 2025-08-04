import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Table } from 'react-bootstrap';
import { useAppContext } from '../../../../../providers/AppProvider';
import { getColor } from '../../../../../helpers/utils';

const ExcelEditor = ({ initialData, onDataChange }) => {
  const [editableData, setEditableData] = useState(initialData);
  const { config } = useAppContext();

  // Synchroniser les données éditables avec les données initiales
  useEffect(() => {
    setEditableData(initialData);
  }, [initialData]);

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = [...editableData];
    newData[rowIndex] = [...newData[rowIndex]];
    newData[rowIndex][colIndex] = value;
    setEditableData(newData);
  };

  const handleSaveChanges = () => {
    onDataChange(editableData);
  };

  const handleCancel = () => {
    setEditableData(initialData); // Restaurer les données originales
    onDataChange(initialData);
  };

  if (!editableData || editableData.length === 0) {
    return <p className="text-center">Aucune donnée à afficher.</p>;
  }

  const headers = editableData[0];
  const rows = editableData.slice(1);

  // Couleurs adaptatives basées sur le thème
  const isDark = config.isDark;
  const primaryColor = getColor('primary') || '#2c7be5';
  const secondaryColor = getColor('secondary') || '#6c757d';
  const backgroundColor = isDark ? '#2a2d35' : '#ffffff';
  const headerBackground = isDark 
    ? 'linear-gradient(135deg, #3a3f4b 0%, #2a2d35 100%)'
    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
  const headerTextColor = isDark ? '#ffffff' : '#495057';
  const borderColor = isDark ? '#495057' : '#dee2e6';
  const rowBackground = isDark ? '#2a2d35' : '#ffffff';
  const alternateRowBackground = isDark ? '#343a40' : '#f8f9fa';
  const textColor = isDark ? '#e9ecef' : '#212529';
  const inputBackground = isDark ? '#343a40' : '#ffffff';
  const inputBorderColor = isDark ? '#495057' : '#ced4da';
  const inputFocusColor = isDark ? '#495057' : primaryColor;

  // Configuration des largeurs de colonnes
  const getColumnWidth = (header, index) => {
    const columnWidths = {
      'code produit': '100px',
      'libelle': '140px',
      'prix achat': '80px',
      'prix vente': '80px',
      'stock disponible': '100px',
      'seuil rupture stock': '120px',
      'categorie produit': '120px',
      'image url': '160px'
    };
    
    return columnWidths[header] || '120px';
  };

  return (
    <div className="excel-editor-container" style={{ marginBottom: '20px' }}>
      <div
        style={{
          maxHeight: '60vh',
          overflow: 'auto',
          borderRadius: '12px',
          boxShadow: isDark 
            ? '0 8px 24px rgba(0, 0, 0, 0.4)'
            : '0 8px 24px rgba(0, 0, 0, 0.15)',
          background: backgroundColor,
          scrollbarWidth: 'thin',
          scrollbarColor: `${primaryColor} ${borderColor}`
        }}
        className="custom-scrollbar-container"
      >
        <Table bordered hover responsive className="table-sm mb-0">
          <thead
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              background: headerBackground,
              color: headerTextColor,
              boxShadow: isDark 
                ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                : '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <tr>
              {headers.map((col, colIndex) => (
                <th
                  key={colIndex}
                  style={{
                    width: getColumnWidth(col, colIndex),
                    minWidth: getColumnWidth(col, colIndex),
                    maxWidth: getColumnWidth(col, colIndex),
                    fontSize: '14px',
                    padding: '16px 12px',
                    border: `1px solid ${borderColor}`,
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    letterSpacing: '0.3px',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}
                  title={col}
                >
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {col ?? ''}
                  </div>
                  {/* Effet de brillance subtil */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                      animation: 'shimmer 3s infinite'
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  background: rowIndex % 2 === 0 ? rowBackground : alternateRowBackground,
                  color: textColor
                }}
                className="table-row-hover"
              >
                {headers.map((header, colIndex) => (
                  <td 
                    key={colIndex} 
                    style={{ 
                      padding: '8px', 
                      border: `1px solid ${borderColor}`,
                      width: getColumnWidth(header, colIndex),
                      minWidth: getColumnWidth(header, colIndex),
                      maxWidth: getColumnWidth(header, colIndex)
                    }}
                  >
                    <Form.Control
                      type="text"
                      value={row[colIndex] ?? ''}
                      onChange={e =>
                        handleCellChange(rowIndex + 1, colIndex, e.target.value)
                      }
                      style={{
                        fontSize: '14px',
                        padding: '8px 10px',
                        minHeight: '36px',
                        borderRadius: '6px',
                        border: `1px solid ${inputBorderColor}`,
                        background: inputBackground,
                        color: textColor,
                        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                        textAlign: 'center',
                        width: '100%',
                        maxWidth: '100%'
                      }}
                      className="form-control-sm custom-input"
                      placeholder={header}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="d-flex justify-content-end mt-3">
        <Button
          variant="outline-secondary"
          onClick={handleCancel}
          style={{
            marginRight: '10px',
            padding: '8px 16px',
            fontSize: '14px',
            borderRadius: '8px'
          }}
        >
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleSaveChanges}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            borderRadius: '8px',
            background: primaryColor,
            borderColor: primaryColor
          }}
        >
          Sauvegarder
        </Button>
      </div>
      <style>
        {`
          .custom-scrollbar-container::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .custom-scrollbar-container::-webkit-scrollbar-track {
            background: ${borderColor};
            border-radius: 12px;
          }
          .custom-scrollbar-container::-webkit-scrollbar-thumb {
            background: ${primaryColor};
            border-radius: 12px;
            transition: background 0.3s ease;
          }
          .custom-scrollbar-container::-webkit-scrollbar-thumb:hover {
            background: ${isDark ? '#1a1d23' : '#0056b3'};
          }
          .table-row-hover:hover {
            background: ${isDark ? '#3a3f4b' : '#e7f1ff'} !important;
            transform: scale(1.01);
            transition: background 0.3s ease, transform 0.3s ease;
            box-shadow: ${isDark 
              ? '0 2px 8px rgba(0, 0, 0, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.1)'};
          }
          .custom-input:focus {
            border-color: ${inputFocusColor} !important;
            box-shadow: 0 0 0 0.2rem ${isDark 
              ? 'rgba(73, 80, 87, 0.25)' 
              : 'rgba(44, 123, 229, 0.25)'} !important;
            outline: none;
          }
          .custom-input::placeholder {
            color: ${isDark ? '#6c757d' : '#6c757d'};
          }
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }
        `}
      </style>
    </div>
  );
};

ExcelEditor.propTypes = {
  initialData: PropTypes.arrayOf(PropTypes.array).isRequired,
  onDataChange: PropTypes.func.isRequired
};

export default React.memo(ExcelEditor);
