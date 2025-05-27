import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import apiServiceSettings from '../../../../services/api.service.settings';

// Charger une image comme data URL
const loadImage = url => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () =>
      reject(new Error(`Échec du chargement de l'image: ${url}`));
    img.src = url;
  });
};

const InvoiceGenerator = {
  generateInvoice: async (
    saleData,
    cartItems,
    customerInfo = {},
    companyInfo = {}
  ) => {
    const doc = new jsPDF();

    // Récupérer les paramètres depuis le backend
    let settings;
    try {
      settings = await apiServiceSettings.getSettings();
      if (!settings) {
        throw new Error('Aucune donnée de paramètres reçue');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      settings = {};
    }

    // Informations de l'entreprise (uniquement depuis l'API)
    const company = {
      name: settings.shopName || '',
      address: settings.street || '',
      city: settings.country || '',
      region: settings.region || '',
      department: settings.department || '',
      neighborhood: settings.neighborhood || '',
      phone: settings.phone || '',
      email: settings.email || '',
      website: settings.websiteUrl || ''
    };

    // Charger le logo
    let logoDataUrl = null;
    if (settings.logo) {
      try {
        logoDataUrl = await loadImage(settings.logo);
      } catch (error) {
        console.error('Erreur lors du chargement du logo:', error);
      }
    }

    // Fonction pour dessiner l'en-tête
    const drawHeader = () => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);

      // Afficher le logo ou un placeholder si absent
      if (logoDataUrl) {
        try {
          doc.addImage(logoDataUrl, 'PNG', 15, 10, 30, 12);
        } catch (error) {
          console.error("Erreur lors de l'ajout de l'image au PDF:", error);
          doc.setDrawColor(0, 0, 0);
          doc.roundedRect(15, 10, 30, 12, 3, 3, 'S');
          doc.setFontSize(10);
          doc.text('Logo', 30, 18, { align: 'center' });
        }
      } else {
        doc.setDrawColor(0, 0, 0);
        doc.roundedRect(15, 10, 30, 12, 3, 3, 'S');
        doc.setFontSize(10);
        doc.text('Logo', 30, 18, { align: 'center' });
      }

      doc.setFontSize(14);
      doc.text(company.name.toUpperCase(), 50, 15);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`${company.address}, ${company.neighborhood}`, 50, 22);
      doc.text(
        `${company.department}, ${company.region}, ${company.city}`,
        50,
        28
      );
      doc.text(`Tél: ${company.phone}`, 50, 34);
      doc.text(`Email: ${company.email}`, 50, 40);

      // Titre facture
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('FACTURE', 195, 18, { align: 'right' });

      // Détails facture
      const currentDate = format(new Date(), 'dd/MM/yyyy', { locale: fr });
      const invoiceNumber = `INV-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')}`;
      const customerId =
        customerInfo.id || `CUST-${Math.floor(Math.random() * 1000)}`;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${currentDate}`, 195, 25, { align: 'right' });
      doc.text(`N° Facture: ${invoiceNumber}`, 195, 31, { align: 'right' });
      doc.text(`N° Client: ${customerId}`, 195, 37, { align: 'right' });

      // Ligne de séparation
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(15, 45, 195, 45);
    };

    // Fonction pour dessiner les informations client
    const drawCustomerInfo = () => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Facturé à:', 15, 55);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(customerInfo.fullName || '', 15, 62);
      doc.text(customerInfo.phoneNumber || '', 15, 68);
    };

    // Fonction pour dessiner le tableau des informations de paiement
    const drawPaymentTable = startY => {
      const paymentHeader = [
        'N° BDC',
        'Date Expédition',
        'Vendeur',
        'Modalités'
      ];
      const paymentData = [
        '',
        format(new Date(), 'dd/MM/yyyy', { locale: fr }),
        '',
        saleData.modePaiement.toUpperCase()
      ];

      doc.autoTable({
        startY,
        head: [paymentHeader],
        body: [paymentData],
        theme: 'grid',
        headStyles: {
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          lineWidth: 0.2,
          lineColor: [0, 0, 0]
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          textColor: [0, 0, 0],
          lineWidth: 0.2,
          lineColor: [0, 0, 0]
        }
      });
    };

    // Fonction pour dessiner le pied de page
    const drawFooter = finalY => {
      doc.setLineWidth(0.3);
      doc.line(15, finalY + 15, 195, finalY + 15);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.text('Merci pour votre confiance !', 105, finalY + 25, {
        align: 'center'
      });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const contactText = `Contactez-nous: ${company.phone} | ${company.email}${
        company.website ? ` | ${company.website}` : ''
      }`;
      doc.text(contactText, 105, finalY + 32, { align: 'center' });
    };

    // Dessiner la première page
    drawHeader();
    drawCustomerInfo();
    drawPaymentTable(80);

    // Tableau des produits
    const itemsTableHead = [
      'N°',
      'Description',
      'Qté',
      'Prix Unitaire',
      'Total'
    ];
    const maxItems = 15;
    let subTotal = 0;
    const itemsPerPage = [];
    for (let i = 0; i < cartItems.length; i += maxItems) {
      itemsPerPage.push(cartItems.slice(i, i + maxItems));
    }

    for (let page = 0; page < itemsPerPage.length; page++) {
      if (page > 0) {
        doc.addPage();
        drawHeader();
        drawCustomerInfo();
        drawPaymentTable(80);
      }

      const itemsTableBody = [];
      const pageItems = itemsPerPage[page];

      for (let i = 0; i < pageItems.length; i++) {
        const item = pageItems[i];
        const unitPrice =
          item.prixVente || parseInt(item.totalPrice / item.quantity, 10) || 0;
        const quantity = item.quantity || item.quantiteVendu || 1;
        const totalPrice = unitPrice * quantity;

        subTotal += totalPrice;

        itemsTableBody.push([
          `${page * maxItems + i + 1}`,
          (item.libelle || 'Produit').replace(/[\n\r]/g, ' ').substring(0, 30),
          quantity.toString(),
          `XOF ${unitPrice.toFixed(0)}`,
          `XOF ${totalPrice.toFixed(0)}`
        ]);
      }

      doc.autoTable({
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 80,
        head: [itemsTableHead],
        body: itemsTableBody,
        theme: 'grid',
        headStyles: {
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          lineWidth: 0.2,
          lineColor: [0, 0, 0]
        },
        columnStyles: {
          0: { cellWidth: 14.4, halign: 'center' },
          1: { cellWidth: 72, halign: 'left' },
          2: { cellWidth: 21.6, halign: 'center' },
          3: { cellWidth: 36, halign: 'right' },
          4: { cellWidth: 36, halign: 'right' }
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          textColor: [0, 0, 0],
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
          overflow: 'ellipsize'
        }
      });

      // Ajouter le total et la signature uniquement sur la dernière page
      if (page === itemsPerPage.length - 1) {
        const finalY = doc.lastAutoTable.finalY;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Total:', 150, finalY + 8);
        doc.text(`XOF ${subTotal.toFixed(0)}`, 195, finalY + 8, {
          align: 'right'
        });

        // Signature
        const signatureY = finalY + 15;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('Signature:', 15, signatureY);
        doc.setLineWidth(0.3);
        doc.line(40, signatureY, 80, signatureY); // Ligne pour la signature

        // Pied de page
        drawFooter(signatureY);
      } else {
        // Pied de page sur les pages intermédiaires
        drawFooter(doc.lastAutoTable.finalY);
      }
    }

    return doc;
  },

  downloadInvoice: async (
    saleData,
    cartItems,
    customerInfo = {},
    companyInfo = {}
  ) => {
    const doc = await InvoiceGenerator.generateInvoice(
      saleData,
      cartItems,
      customerInfo,
      companyInfo
    );
    const fileName = `facture_${format(new Date(), 'yyyyMMdd')}_${Math.floor(
      Math.random() * 1000
    )}.pdf`;
    doc.save(fileName);
    return fileName;
  }
};

export default InvoiceGenerator;
