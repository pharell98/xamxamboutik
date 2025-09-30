import React, { useState, useCallback } from 'react';
import { Card, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilter, 
  faSyncAlt,
  faFileInvoice
} from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from 'providers/AppProvider';
import { useToast } from 'components/common/Toast';
import useInvoices from 'hooks/useInvoices';
import InvoiceItem from './InvoiceItem';
import InvoiceGenerator from './InvoiceGenerator';

const InvoiceFilters = ({ filters, onFiltersChange, onRefresh }) => {
  const filterOptions = [
    { value: 'today', label: "Aujourd'hui" },
    { value: 'month', label: 'Ce mois' },
    { value: 'all', label: 'Toutes' }
  ];

  return (
    <div className="mb-3 p-3 bg-light rounded border">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <small className="fw-semibold text-muted">
          <FontAwesomeIcon icon={faFilter} className="me-1" />
          Filtres
        </small>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={onRefresh}
          className="btn-sm d-flex align-items-center gap-1"
        >
          <FontAwesomeIcon icon={faSyncAlt} />
          <span className="d-none d-md-inline">Actualiser</span>
        </Button>
      </div>
      <Row className="g-2">
        <Col md={6}>
          <Form.Group className="mb-0">
            <Form.Label className="small fw-semibold mb-1">
              Période
            </Form.Label>
            <Form.Select
              size="sm"
              value={filters.period}
              onChange={(e) => onFiltersChange({ period: e.target.value })}
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-0">
            <Form.Label className="small fw-semibold mb-1">
              Date Spécifique
            </Form.Label>
            <Form.Control
              size="sm"
              type="date"
              value={filters.specificDate}
              onChange={(e) => onFiltersChange({ specificDate: e.target.value })}
              placeholder="Sélectionner une date"
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

const LoadingState = () => (
  <div className="text-center py-5">
    <Spinner animation="border" variant="primary" className="mb-3" />
    <h6 className="text-muted">Chargement des factures...</h6>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="text-center py-5">
    <FontAwesomeIcon 
      icon={faFileInvoice} 
      className="text-danger mb-3" 
      size="3x" 
    />
    <h6 className="text-danger mb-3">Erreur lors du chargement</h6>
    <p className="text-muted mb-3">{error}</p>
    <Button variant="outline-primary" onClick={onRetry}>
      <FontAwesomeIcon icon={faSyncAlt} className="me-2" />
      Réessayer
    </Button>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-5">
    <FontAwesomeIcon 
      icon={faFileInvoice} 
      className="text-muted mb-3" 
      size="3x" 
    />
    <h6 className="text-muted mb-2">Aucune facture trouvée</h6>
    <p className="text-muted">
      Aucune facture ne correspond aux critères sélectionnés.
    </p>
  </div>
);
const InvoiceAccordion = () => {
  const { config: { isDark } } = useAppContext();
  const { addToast } = useToast();
  const [openFacture, setOpenFacture] = useState(null);
  const [printingFacture, setPrintingFacture] = useState(null);

  const {
    factures,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    refresh
  } = useInvoices();

  const handleToggleFacture = useCallback((numeroFacture) => {
    setOpenFacture(openFacture === numeroFacture ? null : numeroFacture);
  }, [openFacture]);

  const handlePrintFacture = useCallback(async (facture) => {
    setPrintingFacture(facture.numeroFacture);
    
    try {
      addToast({
        title: 'Génération',
        message: `Génération de la facture ${facture.numeroFacture}...`,
        type: 'info',
        duration: 2000
      });

      // Préparer les données de la vente pour l'InvoiceGenerator
      const saleData = {
        modePaiement: facture.modePaiement,
        montantTotal: facture.montantTotal
      };

      // Préparer les informations client
      const customerInfo = {
        fullName: facture.nomClient || 'Client',
        phoneNumber: facture.telephoneClient || '',
        id: facture.numeroFacture
      };

      // Convertir les détails de facture en format compatible avec InvoiceGenerator
      const cartItems = facture.detailFacture?.map(detail => ({
        id: detail.libelle, // Utiliser le libellé comme ID temporaire
        libelle: detail.libelle,
        quantity: detail.quantite,
        quantiteVendu: detail.quantite,
        prixVente: detail.prix,
        totalPrice: detail.montantTotal,
        image: '/no-image.svg' // Image par défaut
      })) || [];

      // Préparer les informations utilisateur
      const userInfo = {
        utilisateurId: facture.utilisateurId,
        utilisateurNom: facture.utilisateurNom
      };

      // Générer et télécharger la facture
      const fileName = await InvoiceGenerator.downloadInvoice(
        saleData,
        cartItems,
        customerInfo,
        {}, // Company info sera récupéré depuis l'API dans InvoiceGenerator
        userInfo
      );

      addToast({
        title: 'Succès',
        message: `Facture ${fileName} téléchargée avec succès`,
        type: 'success',
        duration: 4000
      });
    } catch (error) {
      console.error('Erreur génération facture:', error);
      addToast({
        title: 'Erreur',
        message: 'Erreur lors de la génération de la facture',
        type: 'error',
        duration: 4000
      });
    } finally {
      setPrintingFacture(null);
    }
  }, [addToast]);

  const handleFiltersChange = useCallback((newFilters) => {
    updateFilters(newFilters);
    setOpenFacture(null);
  }, [updateFilters]);

  const handleRefresh = useCallback(() => {
    refresh();
    setOpenFacture(null);
  }, [refresh]);

  return (
    <div className="invoice-accordion-container">
      <style>
        {`
          .invoice-accordion-container {
            animation: fadeIn 0.5s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .invoice-fixed-header {
            position: sticky;
            top: 0;
            z-index: 10;
            background: white;
            padding-bottom: 1rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid #e9ecef;
          }
          .invoice-fixed-header.dark {
            background: #212529;
            border-bottom-color: #495057;
          }
          .invoice-scrollable-content {
            max-height: 60vh;
            overflow-y: auto;
          }
          .invoice-item {
            transition: all 0.3s ease;
            margin-bottom: 0.5rem !important;
          }
          .invoice-item:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          }
          .invoice-item .border-top {
            border-top: 1px solid #e9ecef !important;
            margin: 0 !important;
          }
          .invoice-item .p-3 {
            padding: 1rem !important;
          }
          .invoice-header {
            transition: background-color 0.2s ease;
          }
          .invoice-header:hover {
            background-color: #f8f9fa !important;
          }
          .invoice-header.dark:hover {
            background-color: #343a40 !important;
          }
          .invoice-product-item {
            transition: background-color 0.2s ease;
          }
          .invoice-product-item:hover {
            background-color: #f8f9fa;
          }
          .invoice-product-item.dark:hover {
            background-color: #343a40;
          }
        `}
      </style>

      {/* En-tête et filtres fixes */}
      <div className={`invoice-fixed-header ${isDark ? 'dark' : ''}`}>
        {/* En-tête */}
        <div className="mb-3">
          <h6 className="mb-1 fw-bold">Historique des Factures</h6>
          <small className="text-muted">Consultez et gérez vos factures de vente</small>
        </div>

        {/* Filtres */}
        <InvoiceFilters 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Contenu principal */}
      <Card className={`${isDark ? 'bg-dark text-white' : ''}`}>
        <Card.Header className={`d-flex justify-content-between align-items-center ${
          isDark ? 'bg-dark border-dark' : 'bg-body-tertiary'
        }`}>
          <h6 className="mb-0 fw-semibold">
            <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
            Factures ({pagination.totalElements})
          </h6>
          {pagination.totalPages > 1 && (
            <small className="text-muted">
              Page {pagination.currentPage + 1} sur {pagination.totalPages}
            </small>
          )}
        </Card.Header>

        <Card.Body className={`invoice-scrollable-content ${isDark ? 'bg-dark' : ''}`}>
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} onRetry={handleRefresh} />
          ) : factures.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="invoice-list">
              {factures.map((facture) => (
                <div key={facture.numeroFacture} className="invoice-item">
                  <InvoiceItem
                    facture={facture}
                    isOpen={openFacture === facture.numeroFacture}
                    onToggle={() => handleToggleFacture(facture.numeroFacture)}
                    onPrint={() => handlePrintFacture(facture)}
                    isDark={isDark}
                    isPrinting={printingFacture === facture.numeroFacture}
                  />
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default InvoiceAccordion;
