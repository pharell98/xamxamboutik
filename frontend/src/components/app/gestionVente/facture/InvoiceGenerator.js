import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import apiServiceSettings from '../../../../services/api.service.settings';

// Constants
const COLORS = {
  BLACK: [0, 0, 0],
  GRAY: [128, 128, 128],
  LIGHT_GRAY: [240, 240, 240]
};

const FONT_SIZES = {
  TITLE: 18,
  HEADER: 14,
  SUBTITLE: 11,
  NORMAL: 9,
  SMALL: 8
};

const MARGINS = {
  LEFT: 15,
  RIGHT: 195,
  TOP: 10
};

/**
 * Charge une image et la convertit en data URL
 */
const loadImage = async (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error(`Échec du chargement: ${url}`));
    img.src = url;
  });
};

/**
 * Récupère les paramètres de l'entreprise depuis l'API
 */
const getCompanySettings = async () => {
  try {
    const settings = await apiServiceSettings.getSettings();
    if (!settings) throw new Error('Aucune donnée reçue');
    
    return {
      name: settings.shopName || 'Boutique',
      address: settings.street || '',
      city: settings.country || '',
      region: settings.region || '',
      department: settings.department || '',
      neighborhood: settings.neighborhood || '',
      phone: settings.phone || '',
      email: settings.email || '',
      website: settings.websiteUrl || '',
      logo: settings.logo || null
    };
  } catch (error) {
    console.error('Erreur récupération paramètres:', error);
    return {
      name: 'Boutique',
      address: '',
      city: '',
      region: '',
      department: '',
      neighborhood: '',
      phone: '',
      email: '',
      website: '',
      logo: null
    };
  }
};

/**
 * Classe pour générer des factures PDF
 */
class InvoiceGenerator {
  constructor() {
    this.doc = new jsPDF();
    this.currentY = MARGINS.TOP;
  }

  /**
   * Dessine le logo ou un placeholder
   */
  async drawLogo(logoUrl) {
    const logoX = MARGINS.LEFT;
    const logoY = MARGINS.TOP;
    const logoWidth = 30;
    const logoHeight = 12;

    if (logoUrl) {
      try {
        const logoDataUrl = await loadImage(logoUrl);
        this.doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
        return;
      } catch (error) {
        console.error('Erreur chargement logo:', error);
      }
    }

    // Placeholder si pas de logo
    this.doc.setDrawColor(...COLORS.BLACK);
    this.doc.roundedRect(logoX, logoY, logoWidth, logoHeight, 3, 3, 'S');
    this.doc.setFontSize(FONT_SIZES.NORMAL);
    this.doc.text('Logo', logoX + logoWidth/2, logoY + logoHeight/2 + 2, { align: 'center' });
  }

  /**
   * Dessine l'en-tête de la facture
   */
  drawHeader(company, invoiceData) {
    // Nom de l'entreprise
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(FONT_SIZES.HEADER);
    this.doc.text(company.name.toUpperCase(), 50, 15);

    // Adresse de l'entreprise
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(FONT_SIZES.NORMAL);
    let addressY = 22;
    if (company.address) {
      this.doc.text(`${company.address}, ${company.neighborhood}`, 50, addressY);
      addressY += 6;
    }
    if (company.department) {
      this.doc.text(`${company.department}, ${company.region}, ${company.city}`, 50, addressY);
      addressY += 6;
    }
    if (company.phone) {
      this.doc.text(`Tél: ${company.phone}`, 50, addressY);
      addressY += 6;
    }
    if (company.email) {
      this.doc.text(`Email: ${company.email}`, 50, addressY);
    }

    // Titre et détails facture
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(FONT_SIZES.TITLE);
    this.doc.text('FACTURE', MARGINS.RIGHT, 18, { align: 'right' });

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(FONT_SIZES.NORMAL);
    this.doc.text(`Date: ${invoiceData.date}`, MARGINS.RIGHT, 25, { align: 'right' });
    this.doc.text(`N° Facture: ${invoiceData.number}`, MARGINS.RIGHT, 31, { align: 'right' });
    this.doc.text(`N° Client: ${invoiceData.customerId}`, MARGINS.RIGHT, 37, { align: 'right' });

    // Ligne de séparation
    this.doc.setDrawColor(...COLORS.BLACK);
    this.doc.setLineWidth(0.3);
    this.doc.line(MARGINS.LEFT, 45, MARGINS.RIGHT, 45);
  }

  /**
   * Dessine les informations client
   */
  drawCustomerInfo(customerInfo) {
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(FONT_SIZES.SUBTITLE);
    this.doc.text('Facturé à:', MARGINS.LEFT, 55);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(FONT_SIZES.NORMAL);
    this.doc.text(customerInfo.fullName || 'Client', MARGINS.LEFT, 62);
    this.doc.text(customerInfo.phoneNumber || '', MARGINS.LEFT, 68);
  }

  /**
   * Dessine le tableau des informations de paiement
   */
  drawPaymentInfo(saleData, startY) {
    const paymentData = [
      ['', format(new Date(), 'dd/MM/yyyy', { locale: fr }), '', saleData.modePaiement.toUpperCase()]
    ];

    // Vérifier si autoTable existe
    if (typeof this.doc.autoTable !== 'function') {
      console.error('autoTable non disponible, utilisation du fallback');
      this.drawPaymentInfoFallback(saleData, startY);
      return startY + 20;
    }

    try {
      this.doc.autoTable({
        startY,
        head: [['N° BDC', 'Date Expédition', 'Vendeur', 'Modalités']],
        body: paymentData,
        theme: 'grid',
        headStyles: {
          fillColor: COLORS.LIGHT_GRAY,
          textColor: COLORS.BLACK,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: FONT_SIZES.SMALL
        },
        styles: {
          fontSize: FONT_SIZES.SMALL,
          cellPadding: 3,
          textColor: COLORS.BLACK
        }
      });
      return this.doc.lastAutoTable.finalY;
    } catch (error) {
      console.error('Erreur autoTable:', error);
      this.drawPaymentInfoFallback(saleData, startY);
      return startY + 20;
    }
  }

  /**
   * Fallback pour dessiner les infos de paiement sans autoTable
   */
  drawPaymentInfoFallback(saleData, startY) {
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(FONT_SIZES.NORMAL);
    this.doc.text('Informations de paiement:', MARGINS.LEFT, startY);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Mode: ${saleData.modePaiement.toUpperCase()}`, MARGINS.LEFT, startY + 8);
    this.doc.text(`Date: ${format(new Date(), 'dd/MM/yyyy', { locale: fr })}`, MARGINS.LEFT, startY + 16);
  }

  /**
   * Dessine le tableau des produits
   */
  drawProductsTable(cartItems, startY) {
    if (typeof this.doc.autoTable !== 'function') {
      return this.drawProductsTableFallback(cartItems, startY);
    }

    const tableData = cartItems.map((item, index) => {
      const unitPrice = item.prixVente || Math.floor(item.totalPrice / item.quantity) || 0;
      const quantity = item.quantity || item.quantiteVendu || 1;
      const totalPrice = unitPrice * quantity;

      return [
        (index + 1).toString(),
        (item.libelle || 'Produit').substring(0, 30),
        quantity.toString(),
        `${unitPrice.toLocaleString()} XOF`,
        `${totalPrice.toLocaleString()} XOF`
      ];
    });

    try {
      this.doc.autoTable({
        startY,
        head: [['N°', 'Description', 'Qté', 'Prix Unitaire', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: COLORS.LIGHT_GRAY,
          textColor: COLORS.BLACK,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: FONT_SIZES.SMALL
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 70, halign: 'left' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 40, halign: 'right' },
          4: { cellWidth: 40, halign: 'right' }
        },
        styles: {
          fontSize: FONT_SIZES.SMALL,
          cellPadding: 3,
          textColor: COLORS.BLACK
        }
      });
      return this.doc.lastAutoTable.finalY;
    } catch (error) {
      console.error('Erreur tableau produits:', error);
      return this.drawProductsTableFallback(cartItems, startY);
    }
  }

  /**
   * Fallback pour dessiner le tableau des produits sans autoTable
   */
  drawProductsTableFallback(cartItems, startY) {
    let currentY = startY + 10;
    
    // En-tête
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(FONT_SIZES.NORMAL);
    this.doc.text('Produits commandés:', MARGINS.LEFT, currentY);
    currentY += 10;

    // Produits
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(FONT_SIZES.SMALL);
    
    cartItems.forEach((item, index) => {
      const unitPrice = item.prixVente || Math.floor(item.totalPrice / item.quantity) || 0;
      const quantity = item.quantity || item.quantiteVendu || 1;
      const totalPrice = unitPrice * quantity;

      this.doc.text(`${index + 1}. ${item.libelle || 'Produit'}`, MARGINS.LEFT, currentY);
      this.doc.text(`Qté: ${quantity}`, MARGINS.LEFT + 100, currentY);
      this.doc.text(`${totalPrice.toLocaleString()} XOF`, MARGINS.RIGHT - 30, currentY, { align: 'right' });
      currentY += 6;
    });

    return currentY + 10;
  }

  /**
   * Dessine le total et la signature
   */
  drawTotal(total, startY) {
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(FONT_SIZES.SUBTITLE);
    this.doc.text('Total:', 150, startY);
    this.doc.text(`${total.toLocaleString()} XOF`, MARGINS.RIGHT, startY, { align: 'right' });

    // Signature
    const signatureY = startY + 15;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(FONT_SIZES.NORMAL);
    this.doc.text('Signature:', MARGINS.LEFT, signatureY);
    this.doc.setLineWidth(0.3);
    this.doc.line(40, signatureY, 80, signatureY);

    return signatureY;
  }

  /**
   * Dessine le pied de page
   */
  drawFooter(company, startY) {
    const footerY = startY + 15;
    
    this.doc.setLineWidth(0.3);
    this.doc.line(MARGINS.LEFT, footerY, MARGINS.RIGHT, footerY);
    
    this.doc.setFont('helvetica', 'italic');
    this.doc.setFontSize(FONT_SIZES.NORMAL);
    this.doc.text('Merci pour votre confiance !', 105, footerY + 10, { align: 'center' });
    
    if (company.phone || company.email) {
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(FONT_SIZES.SMALL);
      const contactText = `Contactez-nous: ${company.phone || ''} | ${company.email || ''}`;
      this.doc.text(contactText, 105, footerY + 17, { align: 'center' });
    }
  }

  /**
   * Génère la facture complète
   */
  async generate(saleData, cartItems, customerInfo = {}) {
    const company = await getCompanySettings();
    
    // Données de la facture
    const invoiceData = {
      date: format(new Date(), 'dd/MM/yyyy', { locale: fr }),
      number: `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      customerId: customerInfo.id || `CUST-${Math.floor(Math.random() * 1000)}`
    };

    // Calculer le total
    const total = cartItems.reduce((acc, item) => {
      const unitPrice = item.prixVente || Math.floor(item.totalPrice / item.quantity) || 0;
      const quantity = item.quantity || item.quantiteVendu || 1;
      return acc + (unitPrice * quantity);
    }, 0);

    // Dessiner la facture
    await this.drawLogo(company.logo);
    this.drawHeader(company, invoiceData);
    this.drawCustomerInfo(customerInfo);
    
    let currentY = this.drawPaymentInfo(saleData, 80);
    currentY = this.drawProductsTable(cartItems, currentY + 10);
    currentY = this.drawTotal(total, currentY + 10);
    this.drawFooter(company, currentY);

    return this.doc;
  }
}

// Export des fonctions utilitaires
const InvoiceGeneratorUtils = {
  /**
   * Génère et télécharge une facture
   */
  async downloadInvoice(saleData, cartItems, customerInfo = {}, companyInfo = {}) {
    try {
      const generator = new InvoiceGenerator();
      const doc = await generator.generate(saleData, cartItems, customerInfo);
      
      const fileName = `facture_${format(new Date(), 'yyyyMMdd')}_${Math.floor(Math.random() * 1000)}.pdf`;
      doc.save(fileName);
      
      return fileName;
    } catch (error) {
      console.error('Erreur génération facture:', error);
      throw new Error('Impossible de générer la facture');
    }
  },

  /**
   * Génère une facture sans la télécharger
   */
  async generateInvoice(saleData, cartItems, customerInfo = {}, companyInfo = {}) {
    const generator = new InvoiceGenerator();
    return await generator.generate(saleData, cartItems, customerInfo);
  }
};

export default InvoiceGeneratorUtils;