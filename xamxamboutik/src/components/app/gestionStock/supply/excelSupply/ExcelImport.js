import React from 'react';
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';
import { Form } from 'react-bootstrap';

const ExcelImporter = ({ onData }) => {
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

  return (
    <Form.Group controlId="excelImport" className="mb-3">
      <Form.Label style={{ fontSize: '16px', fontWeight: '500' }}>
        Importer un fichier Excel
      </Form.Label>
      <Form.Control
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFile}
        style={{ fontSize: '14px', padding: '10px' }}
      />
      <Form.Text className="text-muted" style={{ fontSize: '12px' }}>
        Sélectionnez un fichier .xlsx ou .xls contenant vos produits.
      </Form.Text>
    </Form.Group>
  );
};

ExcelImporter.propTypes = {
  onData: PropTypes.func.isRequired
};

export default React.memo(ExcelImporter);
