import React from 'react';
import PropTypes from 'prop-types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import IconButton from 'components/common/IconButton';

const DownloadStockPDF = ({ selectedProducts }) => {
  const handleDownload = () => {
    if (!selectedProducts || Object.keys(selectedProducts).length === 0) {
      alert('Aucun produit sélectionné pour le pré-supply');
      return;
    }

    const selectedProductDetails = Object.values(selectedProducts);

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Nom de la boutique', 14, 20);
    doc.setFontSize(12);
    doc.text('Adresse de la boutique', 14, 30);
    doc.text('Téléphone de la boutique', 14, 35);

    const tableData = selectedProductDetails.map(product => [
      product.libelle,
      product.prixAchat,
      product.stockDisponible,
      '' // Quantité à commander (à compléter par l'utilisateur)
    ]);

    doc.autoTable({
      head: [
        ['Produit', 'Prix Achat', 'Quantité en stock', 'Quantité à commander']
      ],
      body: tableData,
      startY: 50
    });

    const date = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
    doc.save(`pre-approvisionnement_${date}.pdf`);
  };

  return (
    <IconButton
      variant="falcon-default"
      size="sm"
      icon="file-download"
      transform="shrink-3"
      className="mx-2"
      iconAlign="middle"
      onClick={handleDownload}
    >
      <span className="d-none d-sm-inline-block d-xl-none d-xxl-inline-block ms-1">
        Télécharger
      </span>
    </IconButton>
  );
};

DownloadStockPDF.propTypes = {
  selectedProducts: PropTypes.object.isRequired
};

export default DownloadStockPDF;
