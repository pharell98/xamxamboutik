import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { useAppContext } from '../../../../../providers/AppProvider';
import { getColor } from '../../../../../helpers/utils';

const ExcelViewer = ({ data }) => {
  const [visibleRows, setVisibleRows] = useState([]);
  const { config } = useAppContext();

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

  // Configuration des largeurs de colonnes
  const getColumnWidth = (header, index) => {
    const columnWidths = {
      'code produit': '100px',
      libelle: '140px',
      'prix achat': '80px',
      'prix vente': '80px',
      'stock disponible': '100px',
      'seuil rupture stock': '120px',
      'categorie produit': '120px',
      'image url': '160px'
    };

    return columnWidths[header] || '120px';
  };

  // Fonction pour tronquer le texte
  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Fonction pour formater l'URL
  const formatUrl = url => {
    if (!url) return '';
    if (url.length <= 25) return url;
    const domain = url.match(/https?:\/\/([^/]+)/);
    if (domain) {
      return domain[1] + '/...';
    }
    return url.substring(0, 25) + '...';
  };

  return (
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
            {headers.map((col, idx) => (
              <th
                key={idx}
                style={{
                  fontSize: '14px',
                  padding: '16px 12px',
                  width: getColumnWidth(col, idx),
                  minWidth: getColumnWidth(col, idx),
                  maxWidth: getColumnWidth(col, idx),
                  border: `1px solid ${borderColor}`,
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  letterSpacing: '0.3px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}
                title={col} // Tooltip pour voir le texte complet
              >
                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {col}
                </div>
                {/* Effet de brillance subtil */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background:
                      'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                    animation: 'shimmer 3s infinite'
                  }}
                />
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
                  : 'translateX(-20px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease',
                background:
                  rIdx % 2 === 0 ? rowBackground : alternateRowBackground,
                color: textColor
              }}
              className="table-row-hover"
            >
              {headers.map((header, cIdx) => (
                <td
                  key={cIdx}
                  style={{
                    padding: '12px',
                    border: `1px solid ${borderColor}`,
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    position: 'relative',
                    width: getColumnWidth(header, cIdx),
                    minWidth: getColumnWidth(header, cIdx),
                    maxWidth: getColumnWidth(header, cIdx)
                  }}
                >
                  <div
                    style={{
                      wordBreak: 'break-word',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%'
                    }}
                    title={row[cIdx] || ''} // Tooltip pour voir le contenu complet
                  >
                    {header === 'image url'
                      ? formatUrl(row[cIdx] || '')
                      : header === 'libelle'
                      ? truncateText(row[cIdx] || '', 25)
                      : row[cIdx] ?? ''}
                  </div>
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
            box-shadow: ${
              isDark
                ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                : '0 2px 8px rgba(0, 0, 0, 0.1)'
            };
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

ExcelViewer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.array).isRequired
};

export default React.memo(ExcelViewer);
