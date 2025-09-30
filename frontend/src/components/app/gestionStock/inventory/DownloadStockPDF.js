import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import IconButton from 'components/common/IconButton';
import { shopSettingsService } from 'services/api.service.settings';

const DownloadStockPDF = ({ selectedProducts }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!selectedProducts || Object.keys(selectedProducts).length === 0) {
      alert('Aucun produit sélectionné pour le pré-supply');
      return;
    }

    setIsLoading(true);

    try {
      // Récupérer les informations de la boutique
      const settingsResponse = await shopSettingsService.getShopSettings();
      const shopSettings = settingsResponse.data;

      const selectedProductDetails = Object.values(selectedProducts);

      // Créer le PDF
      const doc = new jsPDF();

      // Configuration des couleurs
      const primaryColor = [41, 128, 185]; // Bleu
      const secondaryColor = [52, 73, 94]; // Gris foncé
      const accentColor = [231, 76, 60]; // Rouge

      // En-tête avec logo et informations de la boutique
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, 'F');

      // Titre principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('LISTE D\'APPROVISIONNEMENT', 105, 15, { align: 'center' });

      // Sous-titre
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Produits en rupture ou faible stock', 105, 25, { align: 'center' });

      // Informations de la boutique
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(`Boutique: ${shopSettings.shopName || 'Nom de la boutique'}`, 14, 35);

      // Section des informations de contact
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(10);
      let yPosition = 55;

      if (shopSettings.phone) {
        doc.text(`Téléphone: ${shopSettings.phone}`, 14, yPosition);
        yPosition += 5;
      }

      if (shopSettings.email) {
        doc.text(`Email: ${shopSettings.email}`, 14, yPosition);
        yPosition += 5;
      }

      // Adresse complète
      const addressParts = [
        shopSettings.street,
        shopSettings.neighborhood,
        shopSettings.department,
        shopSettings.region,
        shopSettings.country
      ].filter(part => part && part.trim());

      if (addressParts.length > 0) {
        doc.text(`Adresse: ${addressParts.join(', ')}`, 14, yPosition);
        yPosition += 8;
      }

      // Date de génération
      const currentDate = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Généré le: ${currentDate}`, 14, yPosition + 5);

      // Tableau des produits
      const tableData = selectedProductDetails.map(product => [
        product.libelle || 'Nom non disponible',
        `${product.prixAchat || 0} FCFA`,
        product.stockDisponible || 0,
        '' // Quantité à commander (à compléter par l'utilisateur)
      ]);

      // Configuration du tableau
      autoTable(doc, {
        head: [
          ['Produit', 'Prix Achat', 'Stock Disponible', 'Quantité à Commander']
        ],
        body: tableData,
        startY: yPosition + 15,
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 11
        },
        bodyStyles: {
          fontSize: 10,
          textColor: secondaryColor
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 60 }, // Produit
          1: { cellWidth: 35 }, // Prix
          2: { cellWidth: 35 }, // Stock
          3: { cellWidth: 35 }  // Quantité à commander
        },
        margin: { top: 10 }
      });

      // Pied de page avec informations supplémentaires
      const finalY = doc.lastAutoTable.finalY + 10;
      
      doc.setTextColor(...accentColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Instructions:', 14, finalY);
      
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('• Remplissez la colonne "Quantité à Commander" selon vos besoins', 14, finalY + 5);
      doc.text('• Vérifiez les prix avant d\'acheter', 14, finalY + 10);
      doc.text('• Gardez cette liste pour le suivi de vos achats', 14, finalY + 15);

      // Nom du fichier avec date
      const date = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
      const time = new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }).replace(/:/g, '-');
      
      doc.save(`approvisionnement_${date}_${time}.pdf`);

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IconButton
      variant="falcon-default"
      size="sm"
      icon="file-download"
      transform="shrink-3"
      className="mx-0"
      iconAlign="middle"
      onClick={handleDownload}
      disabled={isLoading}
    >
      <span className="d-none d-sm-inline ms-1">
        {isLoading ? 'Génération...' : 'Télécharger'}
      </span>
    </IconButton>
  );
};

DownloadStockPDF.propTypes = {
  selectedProducts: PropTypes.object.isRequired
};

export default DownloadStockPDF;
