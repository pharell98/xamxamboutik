import React from 'react';
import { Badge, Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faReceipt, 
  faUser, 
  faPhone, 
  faPrint, 
  faChevronDown,
  faChevronUp,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const InvoiceProductItem = ({ product, isDark = false }) => (
  <div className={`invoice-product-item d-flex justify-content-between align-items-center py-1 px-2 rounded ${
    isDark ? 'dark' : ''
  }`}>
    <div className="flex-1">
      <div className="fw-semibold small mb-0">
        {product.libelle}
      </div>
      <small className="text-muted">
        {product.prix.toLocaleString()} XOF × {product.quantite}
      </small>
    </div>
    <div className="text-end fw-semibold text-success">
      {product.montantTotal.toLocaleString()} XOF
    </div>
  </div>
);

const InvoiceItem = ({ 
  facture, 
  isOpen, 
  onToggle, 
  onPrint, 
  isDark = false,
  isPrinting = false
}) => {
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
    } catch {
      return dateString;
    }
  };

  const getPaymentModeLabel = (mode) => {
    const modes = {
      'espece': 'Espèces',
      'mobile_money': 'Mobile Money',
      'carte_bancaire': 'Carte Bancaire',
      'virement': 'Virement',
      'cheque': 'Chèque'
    };
    return modes[mode] || mode;
  };

  const getPaymentModeColor = (mode) => {
    const colors = {
      'espece': 'success',
      'mobile_money': 'primary',
      'carte_bancaire': 'info',
      'virement': 'warning',
      'cheque': 'secondary'
    };
    return colors[mode] || 'secondary';
  };

  return (
    <div className={`invoice-item rounded-3 ${
      isDark ? 'bg-dark text-white' : 'bg-white'
    } overflow-hidden shadow-sm`}>
      {/* En-tête de la facture */}
      <div 
        className={`invoice-header p-3 d-flex justify-content-between align-items-center ${
          isDark ? 'bg-dark dark' : 'bg-light'
        }`}
        onClick={onToggle}
        style={{ cursor: 'pointer' }}
      >
        <div className="d-flex align-items-center">
          <div className={`me-3 p-2 rounded-2 ${isDark ? 'bg-primary' : 'bg-primary'}`}>
            <FontAwesomeIcon 
              icon={faReceipt} 
              className="text-white"
              size="sm"
            />
          </div>
          <div>
            <div className="fw-bold mb-1 small">
              {facture.numeroFacture}
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <small className="text-muted">
                {formatDate(facture.dateVente)}
              </small>
              <Badge 
                bg={getPaymentModeColor(facture.modePaiement)}
                className="fs--2 px-2 py-1"
              >
                {getPaymentModeLabel(facture.modePaiement)}
              </Badge>
              {facture.estCredit && (
                <Badge bg="warning" className="fs--2 px-2 py-1">
                  Crédit
                </Badge>
              )}
              {facture.utilisateurNom && (
                <Badge bg="info" className="fs--2 px-2 py-1">
                  <FontAwesomeIcon icon={faUserTie} className="me-1" />
                  {facture.utilisateurNom}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="d-flex align-items-center gap-3">
          <div className="text-end">
            <div className="fw-bold text-success small">
              {facture.montantTotal.toLocaleString()} XOF
            </div>
            {facture.montantRestant > 0 && (
              <small className="text-warning">
                Restant: {facture.montantRestant.toLocaleString()} XOF
              </small>
            )}
          </div>
          <FontAwesomeIcon 
            icon={isOpen ? faChevronUp : faChevronDown} 
            className="text-muted"
          />
        </div>
      </div>

      {/* Contenu détaillé de la facture */}
      {isOpen && (
        <div className={`p-3 ${isDark ? 'bg-dark' : 'bg-white'} border-top`}>
          {/* Détails des produits */}
          <div className="mb-2">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="fw-semibold text-muted">Produits</small>
              <small className="text-muted">
                {facture.detailFacture?.length} article{facture.detailFacture?.length > 1 ? 's' : ''}
              </small>
            </div>
            <div className={`rounded-2 p-2 ${isDark ? 'bg-dark border' : 'bg-light'}`}>
              {facture.detailFacture?.map((product, index) => (
                <InvoiceProductItem 
                  key={index} 
                  product={product} 
                  isDark={isDark}
                />
              ))}
            </div>
          </div>

          {/* Résumé et actions */}
          <div className="d-flex justify-content-between align-items-center pt-1 border-top">
            <div className="text-muted small">
              {(facture.nomClient || facture.telephoneClient) && (
                <div className="mb-1">
                  {facture.nomClient && (
                    <>
                      <FontAwesomeIcon icon={faUser} className="me-1" />
                      {facture.nomClient}
                    </>
                  )}
                  {facture.telephoneClient && (
                    <span className={facture.nomClient ? "ms-2" : ""}>
                      <FontAwesomeIcon icon={faPhone} className="me-1" />
                      {facture.telephoneClient}
                    </span>
                  )}
                </div>
              )}
              {facture.utilisateurNom && (
                <div className="mb-1">
                  <FontAwesomeIcon icon={faUserTie} className="me-1" />
                  Vendeur: <span className="fw-semibold">{facture.utilisateurNom}</span>
                </div>
              )}
              <div>
                Payé: <span className="text-success fw-semibold">{facture.montantPayer.toLocaleString()} XOF</span>
                {facture.montantRestant > 0 && (
                  <span className="ms-2">
                    Restant: <span className="text-warning fw-semibold">{facture.montantRestant.toLocaleString()} XOF</span>
                  </span>
                )}
              </div>
            </div>
            
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={onPrint}
                disabled={isPrinting}
                className="btn-sm d-flex align-items-center gap-1"
              >
                {isPrinting ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    <span className="d-none d-sm-inline">Génération...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPrint} />
                    <span className="d-none d-sm-inline">Imprimer</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceItem;
