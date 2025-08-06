import React from 'react';
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';
import { Form } from 'react-bootstrap';
import { useAppContext } from '../../../../../providers/AppProvider';
import { getColor } from '../../../../../helpers/utils';

const ExcelImporter = ({ onData }) => {
  const { config } = useAppContext();

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        if (!wb.SheetNames.length) {
          onData(
            null,
            new Error('Le fichier Excel ne contient aucune feuille.')
          );
          return;
        }
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        onData(data);
      } catch (error) {
        console.error('Erreur lors de la lecture du fichier Excel:', error);
        onData(null, error);
      }
    };
    reader.onerror = () => {
      console.error('Erreur de lecture du fichier.');
      onData(null, new Error('Erreur de lecture du fichier.'));
    };
    reader.readAsBinaryString(file);
  };

  // Couleurs adaptatives basées sur le thème
  const isDark = config.isDark;
  const primaryColor = getColor('primary') || '#2c7be5';
  const borderColor = isDark ? '#495057' : '#dee2e6';
  const textColor = isDark ? '#e9ecef' : '#212529';
  const inputBackground = isDark ? '#343a40' : '#ffffff';
  const inputBorderColor = isDark ? '#495057' : '#ced4da';
  const labelColor = isDark ? '#e9ecef' : '#495057';
  const helpTextColor = isDark ? '#6c757d' : '#6c757d';

  return (
    <div
      style={{
        padding: '24px',
        borderRadius: '12px',
        background: isDark ? '#2a2d35' : '#f8f9fa',
        border: `2px dashed ${borderColor}`,
        textAlign: 'center',
        transition: 'all 0.3s ease'
      }}
      className="excel-import-container"
    >
      <Form.Group controlId="excelImport" className="mb-3">
        <Form.Label
          style={{
            fontSize: '16px',
            fontWeight: '500',
            color: labelColor,
            marginBottom: '12px'
          }}
        >
          📁 Importer un fichier Excel
        </Form.Label>
        <Form.Control
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFile}
          style={{
            fontSize: '14px',
            padding: '12px',
            background: inputBackground,
            border: `1px solid ${inputBorderColor}`,
            color: textColor,
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        />
        <Form.Text
          className="text-muted"
          style={{
            fontSize: '12px',
            color: helpTextColor,
            marginTop: '8px',
            display: 'block'
          }}
        >
          📋 Sélectionnez un fichier .xlsx ou .xls contenant vos produits avec
          les colonnes :
          <br />
          <code
            style={{
              fontSize: '11px',
              background: isDark ? '#343a40' : '#e9ecef',
              padding: '4px 8px',
              borderRadius: '4px',
              color: isDark ? '#e9ecef' : '#495057'
            }}
          >
            code produit, libelle, prix achat, prix vente, stock disponible,
            seuil rupture stock, categorie produit, image url
          </code>
        </Form.Text>
      </Form.Group>
      <style>
        {`
          .excel-import-container:hover {
            border-color: ${primaryColor};
            background: ${isDark ? '#343a40' : '#e9ecef'};
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .excel-import-container input[type="file"]:focus {
            border-color: ${primaryColor} !important;
            box-shadow: 0 0 0 0.2rem ${
              isDark ? 'rgba(73, 80, 87, 0.25)' : 'rgba(44, 123, 229, 0.25)'
            } !important;
          }
        `}
      </style>
    </div>
  );
};

ExcelImporter.propTypes = {
  onData: PropTypes.func.isRequired
};

export default React.memo(ExcelImporter);
