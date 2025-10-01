import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faTimes } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import apiServiceSettings from '../../../../services/api.service.settings';
import { useAppContext } from 'providers/AppProvider';

const InvoicePreview = ({ 
  show, 
  onHide, 
  saleData, 
  items, 
  customerInfo = {}, 
  userInfo = {},
  onPrint 
}) => {
  const { config: { isDark } } = useAppContext();
  const [company, setCompany] = useState({
    name: 'Boutique',
    logo: null,
    email: '',
    phone: '',
    address: '',
    neighborhood: '',
    region: '',
    country: ''
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const settings = await apiServiceSettings.getSettings();
        const computedLogo = settings && settings.logo
          ? (typeof settings.logo === 'string' ? settings.logo : (settings.logo.preview || null))
          : null;
        
        setCompany({
          name: settings.shopName || 'Boutique',
          logo: computedLogo,
          email: settings.email || '',
          phone: settings.phone || '',
          address: settings.street || '',
          neighborhood: settings.neighborhood || '',
          region: settings.region || '',
          country: settings.country || ''
        });
      } catch (error) {
        console.error('Erreur récupération paramètres:', error);
      }
    };

    if (show) {
      fetchCompany();
    }
  }, [show]);

  const currency = (n) => (n || 0).toLocaleString('fr-FR') + ' XOF';
  const today = format(new Date(), 'dd/MM/yyyy', { locale: fr });

  const total = (items || []).reduce((acc, item) => {
    const unitPrice = item.prixVente || Math.floor((item.totalPrice || 0) / (item.quantity || 1)) || 0;
    const quantity = item.quantity || item.quantiteVendu || 1;
    return acc + (unitPrice * quantity);
  }, 0);

  const locationParts = [company.country, company.region, company.neighborhood]
    .filter(Boolean)
    .join('-');
  const footerLine = `${locationParts}${
    company.address ? ' Rue: ' + company.address : ''
  }${company.phone ? ' Tél: ' + company.phone : ''}${
    company.email ? ' Email: ' + company.email : ''
  }`.trim();

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg" 
      centered
      contentClassName={isDark ? 'bg-dark text-light' : ''}
    >
      <Modal.Header 
        closeButton
        className={isDark ? 'bg-dark text-light border-secondary' : ''}
      >
        <Modal.Title>
          <FontAwesomeIcon icon={faPrint} className="me-2" />
          Aperçu de la facture
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body 
        style={{ maxHeight: '70vh', overflowY: 'auto' }}
        className={isDark ? 'bg-dark text-light' : ''}
      >
        <div className="invoice-preview">
          {/* Header */}
          <div className="row align-items-center border-bottom pb-2 mb-3">
            <div className="col d-flex align-items-center">
              {company.logo && (
                <img 
                  src={company.logo} 
                  alt="logo" 
                  className="me-2" 
                  style={{ height: '34px' }}
                />
              )}
              <div>
                <h5 className="m-0">{company.name}</h5>
                <div className="small text-muted">
                  {[company.phone ? `Tél: ${company.phone}` : '', company.email ? `Email: ${company.email}` : '']
                    .filter(Boolean)
                    .join(' · ')}
                </div>
              </div>
            </div>
            <div className="col text-end">
              <h5 className="m-0">FACTURE</h5>
            </div>
          </div>

          {/* Détails facture */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-4 ms-auto">
              <div className={`card ${isDark ? 'bg-secondary border-secondary' : 'border'}`}>
                <div className={`card-header py-1 text-center fw-semibold ${isDark ? 'bg-dark border-secondary' : ''}`}>
                  DÉTAILS
                </div>
                <div className="card-body py-2">
                  <div>Date: {today}</div>
                  <div>N°: {customerInfo.id || ''}</div>
                  <div>Client: {customerInfo.phoneNumber || 'Non spécifié'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Client */}
          <div className="row mb-3">
            <div className="col-12 col-md-6">
              <div className={`card ${isDark ? 'bg-secondary border-secondary' : 'border'}`}>
                <div className={`card-header py-1 fw-bold ${isDark ? 'bg-dark border-secondary' : ''}`}>
                  FACTURÉ À
                </div>
                <div className="card-body py-2">
                  <div>{customerInfo.fullName || 'Client'}</div>
                  {customerInfo.phoneNumber && <div>{customerInfo.phoneNumber}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Mode de paiement */}
          <div className="mb-2 fw-semibold">Informations de paiement</div>
          <div className="row mb-2">
            <div className="col-12 col-md-6">Mode: {(saleData.modePaiement || '').toUpperCase()}</div>
            <div className="col-12 col-md-6 text-md-end">Date: {today}</div>
          </div>

          {/* Tableau produits */}
          <div className="table-responsive">
            <table className={`table table-sm align-middle ${isDark ? 'table-dark' : ''}`}>
              <thead>
                <tr>
                  <th className="text-center" style={{ width: '6%' }}>N°</th>
                  <th>Description du produit</th>
                  <th className="text-center" style={{ width: '12%' }}>Qté</th>
                  <th className="text-end" style={{ width: '18%' }}>Prix unitaire</th>
                  <th className="text-end" style={{ width: '18%' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(items || []).map((item, index) => {
                  const unitPrice = item.prixVente || Math.floor((item.totalPrice || 0) / (item.quantity || 1)) || 0;
                  const quantity = item.quantity || item.quantiteVendu || 1;
                  const lineTotal = unitPrice * quantity;
                  
                  return (
                    <tr key={index}>
                      <td className="text-center">{index + 1}</td>
                      <td>{item.libelle || 'Produit'}</td>
                      <td className="text-center">{quantity}</td>
                      <td className="text-end">{currency(unitPrice)}</td>
                      <td className="text-end fw-semibold">{currency(lineTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="d-flex justify-content-end my-3">
            <div className={`card ${isDark ? 'bg-secondary border-secondary' : ''}`} style={{ minWidth: '300px' }}>
              <div className="card-body d-flex justify-content-between align-items-center">
                <div className="fw-semibold text-primary">TOTAL À PAYER</div>
                <div className="fw-bold text-success">{currency(total)}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="invoice-footer text-center">
            <hr />
            <div className="text-secondary">Merci pour votre confiance et à bientôt !</div>
            <div className="small text-muted">{footerLine}</div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className={isDark ? 'bg-dark border-secondary' : ''}>
        <Button variant="secondary" onClick={onHide}>
          <FontAwesomeIcon icon={faTimes} className="me-2" />
          Fermer
        </Button>
        <Button variant="primary" onClick={onPrint}>
          <FontAwesomeIcon icon={faPrint} className="me-2" />
          Imprimer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InvoicePreview;