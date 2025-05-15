import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';

const ExcelViewer = ({ data }) => {
  const [visibleRows, setVisibleRows] = useState([]);

  useEffect(() => {
    if (data.length > 1) {
      const rows = data.slice(1);
      setVisibleRows([]);
      rows.forEach((_, index) => {
        setTimeout(() => {
          setVisibleRows(prev => [...prev, index]);
        }, index * 150); // Délai plus rapide pour une animation fluide
      });
    }
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <p className="text-center" style={{ fontSize: '16px', color: '#6c757d' }}>
        Aucune donnée à afficher.
      </p>
    );
  }

  const headers = data[0];
  const rows = data.slice(1);

  return (
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
            {headers.map((col, idx) => (
              <th
                key={idx}
                style={{
                  fontSize: '14px',
                  padding: '14px',
                  minWidth: '150px',
                  border: 'none', // Pas de bordures internes
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr
              key={rIdx}
              style={{
                fontSize: '14px',
                padding: '12px',
                opacity: visibleRows.includes(rIdx) ? 1 : 0,
                transform: visibleRows.includes(rIdx)
                  ? 'translateX(0)'
                  : 'translateX(-20px)', // Animation horizontale pour un effet de vague
                transition: 'opacity 0.6s ease, transform 0.6s ease',
                background: rIdx % 2 === 0 ? '#ffffff' : '#f8f9fa' // Alternance de couleurs
              }}
              className="table-row-hover"
            >
              {headers.map((_, cIdx) => (
                <td
                  key={cIdx}
                  style={{
                    padding: '12px',
                    border: 'none', // Pas de bordures internes
                    borderBottom: '1px solid #dee2e6' // Bordure subtile en bas
                  }}
                >
                  {row[cIdx] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
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
        `}
      </style>
    </div>
  );
};

ExcelViewer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.array).isRequired
};

export default React.memo(ExcelViewer);
