import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Table } from 'react-bootstrap';

const ExcelEditor = ({ initialData, onDataChange }) => {
  const [editableData, setEditableData] = useState(initialData);

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = [...editableData];
    newData[rowIndex] = [...newData[rowIndex]];
    newData[rowIndex][colIndex] = value;
    setEditableData(newData);
  };

  const handleSaveChanges = () => {
    onDataChange(editableData);
  };

  if (!editableData || editableData.length === 0) {
    return <p className="text-center">Aucune donnée à afficher.</p>;
  }

  const headers = editableData[0];
  const rows = editableData.slice(1);

  return (
    <div className="excel-editor-container" style={{ marginBottom: '20px' }}>
      <div
        style={{
          maxHeight: '60vh',
          overflow: 'auto', // Une seule barre de défilement
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)', // Ombre élégante
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)', // Dégradé subtil
          scrollbarWidth: 'thin', // Barre de défilement fine (Firefox)
          scrollbarColor: '#007bff #e9ecef' // Couleur personnalisée (Firefox)
        }}
        className="custom-scrollbar-container"
      >
        <Table bordered hover responsive className="table-sm mb-0">
          <thead
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)', // Dégradé pour l'en-tête
              color: '#fff', // Texte blanc pour contraste
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' // Ombre sous l'en-tête
            }}
          >
            <tr>
              {headers.map((col, colIndex) => (
                <th
                  key={colIndex}
                  style={{
                    minWidth: '150px',
                    fontSize: '14px',
                    padding: '14px',
                    border: 'none', // Pas de bordures internes
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {col ?? ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  background: rowIndex % 2 === 0 ? '#ffffff' : '#f8f9fa' // Alternance de couleurs
                }}
                className="table-row-hover"
              >
                {headers.map((_, colIndex) => (
                  <td key={colIndex} style={{ padding: '4px' }}>
                    <Form.Control
                      type="text"
                      value={row[colIndex] ?? ''}
                      onChange={e =>
                        handleCellChange(rowIndex + 1, colIndex, e.target.value)
                      }
                      style={{
                        fontSize: '14px',
                        padding: '8px',
                        minHeight: '40px',
                        borderRadius: '8px',
                        border: '1px solid #ced4da',
                        transition:
                          'border-color 0.3s ease, box-shadow 0.3s ease'
                      }}
                      className="form-control-sm custom-input"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="text-end mt-3">
        <Button
          variant="success"
          onClick={handleSaveChanges}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'transform 0.2s ease, box-shadow 0.3s ease'
          }}
          className="custom-button"
        >
          Sauvegarder les modifications
        </Button>
      </div>
      <style>
        {`
          .custom-scrollbar-container::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .custom-scrollbar-container::-webkit-scrollbar-track {
            background: #e9ecef;
            border-radius: 12px;
          }
          .custom-scrollbar-container::-webkit-scrollbar-thumb {
            background: #007bff;
            border-radius: 12px;
            transition: background 0.3s ease;
          }
          .custom-scrollbar-container::-webkit-scrollbar-thumb:hover {
            background: #0056b3;
          }
          .table-row-hover:hover {
            background: #e7f1ff !important; /* Couleur de survol */
            transform: scale(1.01); /* Légère mise à l'échelle */
            transition: background 0.3s ease, transform 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .custom-input:focus {
            border-color: #007bff !important;
            box-shadow: 0 0 8px rgba(0, 123, 255, 0.3) !important;
            outline: none !important;
          }
          .custom-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
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
