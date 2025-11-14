import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalculator,
  faPrint,
  faBox,
  faMoneyBill,
  faHandHoldingUsd,
  faShoppingCart,
  faTrash,
  faTimes,
  faFileInvoice,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';

import { useProductContext } from 'providers/ProductProvider';
import { useToast } from '../../../common/Toast';
import { useAppContext } from 'providers/AppProvider';
import venteServiceV1 from 'services/vente.service.v1';
import InvoiceGenerator from '../facture/InvoiceGenerator';
import QuantityController from '../QuantityController';
import CalculatorModal from './CalculatorModal';
import InvoiceAccordion from '../facture/InvoiceAccordion';
import InvoicePreview from '../facture/InvoicePreview';
import { printInvoice as printInvoiceHtml } from '../facture/print/printInvoiceHtml';
import {
  isValidQuantity,
  normalizeQuantity,
  getInvalidCartItems,
  getValidationErrorMessage
} from '../../validatore/cardShema';

// Constants

const TOAST_DURATION = {
  SHORT: 4000,
  MEDIUM: 5000,
  LONG: 7000
};

// Custom hooks
const usePaymentModes = () => {
  const [paymentModes, setPaymentModes] = useState([]);

  useEffect(() => {
    const fetchPaymentModes = async () => {
      try {
        const response = await venteServiceV1.getPaymentModes();
        if (response?.data) {
          setPaymentModes(response.data);
        }
      } catch (error) {
        console.error(
          'Erreur lors de la récupération des modes de paiement',
          error
        );
      }
    };
    fetchPaymentModes();
  }, []);

  return paymentModes;
};

const useCartCalculations = (cartItems, modifiedPrices) => {
  return useMemo(() => {
    const totalCost = cartItems.reduce((acc, item) => {
      const customPrice = modifiedPrices[item.id];
      const unitPrice =
        customPrice ?? Math.floor(item.totalPrice / item.quantity);
      return acc + unitPrice * item.quantity;
    }, 0);

    return { totalCost };
  }, [cartItems, modifiedPrices]);
};

// Components
const CartHeader = ({ showInvoices, onToggleView }) => (
  <div className="cart-header mb-3 d-flex justify-content-between align-items-center">
    <h5 className="mb-0 fw-bold">
      <FontAwesomeIcon
        icon={showInvoices ? faFileInvoice : faShoppingCart}
        className="me-2"
      />
      {showInvoices ? 'Mes Factures' : 'Votre Panier'}
    </h5>
    <Button
      variant="outline-primary"
      size="sm"
      onClick={onToggleView}
      className="d-flex align-items-center gap-2"
      title={showInvoices ? 'Afficher le panier' : 'Afficher les factures'}
    >
      <FontAwesomeIcon icon={showInvoices ? faShoppingCart : faFileInvoice} />
      {showInvoices ? 'Panier' : 'Factures'}
    </Button>
  </div>
);

const CartTableHeader = ({ isDark }) => (
  <div
    className={`row fw-bold px-2 mb-2 py-2 rounded ${
      isDark ? 'bg-dark text-white' : 'bg-light text-dark'
    }`}
  >
    <div className="col-5">
      <FontAwesomeIcon icon={faBox} className="me-1" />
      Produit
    </div>
    <div className="col-3 text-center">Quantité</div>
    <div className="col-4 text-end">
      <FontAwesomeIcon icon={faMoneyBill} className="me-1" />
      Prix
    </div>
  </div>
);

const CartItem = ({
  item,
  index,
  isDark,
  modifiedPrices,
  onPriceChange,
  onQuantityChange,
  onRemove
}) => {
  const customPrice = modifiedPrices[item.id];
  const unitPrice = customPrice ?? Math.floor(item.totalPrice / item.quantity);
  const hasInvalidQuantity = !isValidQuantity(item.quantity);

  return (
    <Card
      key={item.id}
      className={`mb-3 shadow-sm border-200 cart-item ${
        isDark ? 'bg-dark text-white' : ''
      } ${index === 0 ? 'border-primary' : ''}`}
      style={{
        borderLeft: index === 0 ? '4px solid #007bff' : undefined
      }}
    >
      <Card.Body className="p-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-5 d-flex align-items-start">
            <div className="product-image me-2 mb-2 mb-md-0">
              <img
                src={item.image || '/no-image.svg'}
                alt={item.libelle}
                className="rounded"
                style={{
                  width: '50px',
                  height: '50px',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div className="flex-1">
              <h5 className="fs-9 fw-semibold mb-1 product-title">
                {item.libelle}
              </h5>
              <Button
                variant="link"
                size="sm"
                className="text-danger p-0 fs--1"
                onClick={() => onRemove(item)}
              >
                <FontAwesomeIcon icon={faTrash} className="me-1" />
                Supprimer
              </Button>
            </div>
          </div>

          <div className="col-6 col-md-3 d-flex justify-content-center">
            <QuantityController
              quantity={item.quantity}
              handleIncrease={() =>
                onQuantityChange(item.id, item.quantity + 1)
              }
              handleDecrease={() =>
                onQuantityChange(item.id, item.quantity - 1)
              }
              handleChange={val => onQuantityChange(item.id, val)}
              btnClassName="px-1"
              max={item.quantiteDisponible || Infinity}
            />
          </div>

          <div className="col-6 col-md-4 d-flex justify-content-end">
            <Form.Control
              id={`unit-price-${item.id}`}
              name={`unitPrice-${item.id}`}
              type="number"
              min="1"
              max="999999"
              step="1"
              className={`text-end input-spin-none ${
                hasInvalidQuantity ? 'border-danger' : ''
              }`}
              style={{
                width: '100px',
                WebkitAppearance: 'none',
                MozAppearance: 'textfield',
                appearance: 'none'
              }}
              value={unitPrice}
              aria-label={`Prix unitaire ${item.libelle}`}
              onChange={e =>
                onPriceChange(
                  item.id,
                  Math.min(parseInt(e.target.value, 10) || 0, 999999)
                )
              }
            />
            {hasInvalidQuantity && (
              <div className="text-danger small mt-1">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="me-1"
                />
                Quantité requise
              </div>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

const PaymentModeSelector = ({ paymentModes, paymentMode, setPaymentMode }) => {
  if (paymentModes.length === 0) return null;

  return (
    <div className="mb-3">
      <Form.Label className="fw-semibold">Mode de paiement</Form.Label>
      <div>
        {paymentModes.map(mode => (
          <Form.Check
            key={mode}
            type="radio"
            id={`payment-${mode}`}
            label={mode.replace('_', ' ').toUpperCase()}
            name="paymentMode"
            value={mode}
            checked={paymentMode === mode}
            onChange={e => setPaymentMode(e.target.value)}
            inline
          />
        ))}
      </div>
    </div>
  );
};

const CartTotal = ({
  totalCost,
  isLoan,
  printInvoice,
  setIsLoan,
  setPrintInvoice,
  showLoanToggle = true
}) => (
  <div className="cart-total d-flex align-items-center justify-content-between mb-2 p-3 rounded">
    <div className="d-flex flex-wrap gap-3">
      {showLoanToggle && (
        <Form.Check
          type="checkbox"
          id="loan-checkbox"
          label={
            <span>
              <FontAwesomeIcon icon={faHandHoldingUsd} className="me-1" />
              Prêt
            </span>
          }
          checked={isLoan}
          onChange={e => setIsLoan(e.target.checked)}
          className="fs-8"
        />
      )}
      <Form.Check
        type="checkbox"
        id="print-invoice"
        label={
          <span>
            <FontAwesomeIcon icon={faPrint} className="me-1" />
            Générer Facture
          </span>
        }
        checked={printInvoice}
        onChange={e => setPrintInvoice(e.target.checked)}
        className="fs-8"
      />
    </div>
    <h5 className="mb-0 fw-bold">
      <FontAwesomeIcon icon={faCalculator} className="me-2" />
      Total{' '}
      <span className="ms-2 text-primary">
        XOF {totalCost.toLocaleString()}
      </span>
    </h5>
  </div>
);

const CustomerInfoForm = ({
  isLoan,
  printInvoice,
  customerInfo,
  setCustomerInfo
}) => {
  if (!isLoan && !printInvoice) return null;

  return (
    <div className="mt-3">
      <Form.Group className="mb-3">
        <Form.Label htmlFor="customer-fullname">
          Nom complet {isLoan ? '(Prêt)' : '(Facture)'}
        </Form.Label>
        <Form.Control
          id="customer-fullname"
          name="customerFullName"
          type="text"
          placeholder="Entrez le nom complet"
          value={customerInfo.fullName}
          onChange={e =>
            setCustomerInfo(prev => ({
              ...prev,
              fullName: e.target.value
            }))
          }
          required
        />
      </Form.Group>
      <Form.Group>
        <Form.Label htmlFor="customer-phone">Numéro de téléphone</Form.Label>
        <Form.Control
          id="customer-phone"
          name="customerPhone"
          type="tel"
          placeholder="Ex: 77 123 45 67"
          value={customerInfo.phoneNumber}
          onChange={e =>
            setCustomerInfo(prev => ({
              ...prev,
              phoneNumber: e.target.value
            }))
          }
          required
        />
      </Form.Group>
    </div>
  );
};

const CartActions = ({
  onCalculator,
  onClose,
  onValidate,
  onPreview,
  isLoan,
  isValidCustomer,
  isProcessing
}) => (
  <div className="d-flex flex-wrap gap-2 justify-content-between mt-3">
    <div className="d-flex gap-2">
      <Button
        variant="outline-secondary"
        onClick={onCalculator}
        className="btn-sm"
        disabled={isProcessing}
      >
        <FontAwesomeIcon icon={faCalculator} className="me-1" />
        <span className="d-none d-sm-inline">Calculatrice</span>
        <span className="d-inline d-sm-none">Calc</span>
      </Button>

      {onPreview && (
        <Button 
          variant="outline-info" 
          onClick={onPreview} 
          className="btn-sm"
          disabled={isProcessing}
        >
          <FontAwesomeIcon icon={faPrint} className="me-1" />
          <span className="d-none d-sm-inline">Aperçu Facture</span>
          <span className="d-inline d-sm-none">Aperçu</span>
        </Button>
      )}
    </div>

    <div className="d-flex gap-2">
      {onClose && (
        <Button 
          variant="secondary" 
          onClick={onClose} 
          className="btn-sm"
          disabled={isProcessing}
        >
          <FontAwesomeIcon icon={faTimes} className="me-1" />
          <span className="d-none d-sm-inline">Fermer</span>
          <span className="d-inline d-sm-none">X</span>
        </Button>
      )}

      <Button
        variant="success"
        onClick={onValidate}
        disabled={!isValidCustomer || isProcessing}
        className="btn-sm"
      >
        {isProcessing ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {isLoan ? 'Validation...' : 'Validation...'}
          </>
        ) : (
          isLoan ? 'Valider Crédit' : 'Valider Vente'
        )}
      </Button>
    </div>
  </div>
);

// Main component
const CartSection = ({ onClose, show = true }) => {
  const {
    config: { isDark }
  } = useAppContext();
  const { addToast } = useToast();
  const {
    productsState: { cartItems },
    productsDispatch
  } = useProductContext();

  // State
  const [modifiedPrices, setModifiedPrices] = useState({});
  const [isLoan, setIsLoan] = useState(false);
  const defaultCustomerInfo = useMemo(
    () => ({
      fullName: '',
      phoneNumber: ''
    }),
    []
  );
  const [customerInfo, setCustomerInfo] = useState(defaultCustomerInfo);
  const [paymentMode, setPaymentMode] = useState('espece');
  const [printInvoice, setPrintInvoice] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const lastClickTimeRef = useRef(0);
  const MIN_CLICK_INTERVAL = 500; // 500ms minimum entre deux clics

  // Custom hooks
  const paymentModes = usePaymentModes();
  const { totalCost } = useCartCalculations(cartItems, modifiedPrices);

  // Validation
  const isValidCustomer = useMemo(() => {
    if (!isLoan && !printInvoice) return true;
    return (
      customerInfo.fullName.trim() !== '' &&
      customerInfo.phoneNumber.trim() !== ''
    );
  }, [isLoan, printInvoice, customerInfo]);

  // Validation optimisée avec schéma centralisé
  const hasValidQuantities = useMemo(() => {
    return cartItems.every(
      item =>
        isValidQuantity(item.quantity) &&
        item.quantity <= (item.quantiteDisponible || Infinity)
    );
  }, [cartItems]);

  // Handlers
  const handlePriceChange = useCallback((productId, newPrice) => {
    setModifiedPrices(prev => ({ ...prev, [productId]: newPrice }));
  }, []);

  const handleQuantityChange = useCallback(
    (productId, newQuantity) => {
      const item = cartItems.find(item => item.id === productId);
      if (!item) return;

      const maxQuantity = item.quantiteDisponible || Infinity;
      const validQuantity = normalizeQuantity(newQuantity, maxQuantity);

      productsDispatch({
        type: 'UPDATE_CART_ITEM_QUANTITY',
        payload: { productId, quantity: validQuantity }
      });
    },
    [cartItems, productsDispatch]
  );

  const handleRemoveItem = useCallback(
    product => {
      productsDispatch({ type: 'REMOVE_FROM_CART', payload: { product } });
    },
    [productsDispatch]
  );

  const validateCart = useCallback(() => {
    if (!cartItems?.length) {
      addToast({
        title: 'Erreur',
        message: 'Le panier est vide. Veuillez ajouter des produits.',
        type: 'error',
        duration: TOAST_DURATION.MEDIUM
      });
      return false;
    }

    const invalidItems = cartItems.filter(
      item =>
        !item.quantity ||
        item.quantity <= 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity > (item.quantiteDisponible || Infinity)
    );

    if (invalidItems.length > 0) {
      const invalidNames = invalidItems.map(item => item.libelle).join(', ');
      addToast({
        title: 'Erreur',
        message: `Quantités invalides pour : ${invalidNames}`,
        type: 'error',
        duration: TOAST_DURATION.LONG
      });
      return false;
    }

    if (!isValidCustomer) {
      addToast({
        title: 'Erreur',
        message: 'Veuillez remplir tous les champs pour le client',
        type: 'error',
        duration: TOAST_DURATION.MEDIUM
      });
      return false;
    }

    return true;
  }, [cartItems, isValidCustomer, addToast]);

  const resetCartState = useCallback(() => {
    productsDispatch({ type: 'CHECKOUT' });
    setModifiedPrices({});
    setCustomerInfo(defaultCustomerInfo);
    setIsLoan(false);
    setPrintInvoice(false);
    setPaymentMode('espece');
    setShowInvoices(false);
  }, [productsDispatch, defaultCustomerInfo]);

  const handleValidateSale = useCallback(async () => {
    // Protection niveau 0 : Debounce manuel (protection supplémentaire)
    const now = Date.now();
    if (now - lastClickTimeRef.current < MIN_CLICK_INTERVAL) {
      console.warn('[CartSection] ⚠️ Clic trop rapide détecté, ignoré');
      addToast({
        title: 'Clic trop rapide',
        message: 'Veuillez patienter un instant avant de réessayer.',
        type: 'warning',
        duration: TOAST_DURATION.SHORT
      });
      return;
    }
    lastClickTimeRef.current = now;

    // Protection niveau 1 : Vérifier le state React
    if (isProcessingSale) {
      console.warn('[CartSection] ⚠️ Vente déjà en cours de traitement (state), ignorée');
      addToast({
        title: 'Vente en cours',
        message: 'Une vente est déjà en cours de traitement. Veuillez patienter.',
        type: 'warning',
        duration: TOAST_DURATION.SHORT
      });
      return;
    }

    if (!validateCart()) return;

    // Protection niveau 2 : Désactiver immédiatement le bouton
    setIsProcessingSale(true);
    
    console.log('[CartSection] Début de la validation de vente...', {
      produits: cartItems.length,
      montantTotal: totalCost,
      modePaiement: paymentMode
    });

    const detailVenteList = cartItems.map(item => {
      const customPrice = modifiedPrices[item.id];
      const unitPrice =
        customPrice ?? Math.floor(item.totalPrice / item.quantity);
      return {
        produitId: item.id,
        prixVente: unitPrice,
        quantiteVendu: item.quantity
      };
    });

    const saleData = {
      detailVenteList,
      modePaiement: paymentMode,
      montantTotal: totalCost
    };

    try {
      const response = await venteServiceV1.createVente(saleData);
      console.log('[CartSection] ✅ Vente créée avec succès, ID:', response.data?.id);

      if (printInvoice) {
        try {
          const invoiceItems = cartItems.map(item => ({
            ...item,
            prixVente:
              modifiedPrices[item.id] ??
              Math.floor(item.totalPrice / item.quantity),
            quantiteVendu: item.quantity
          }));

          // Utiliser la nouvelle méthode HTML en priorité
          await printInvoiceHtml(saleData, invoiceItems, customerInfo, {});

          addToast({
            title: 'Facture générée',
            message: 'La facture a été générée avec succès',
            type: 'success',
            duration: TOAST_DURATION.MEDIUM
          });
        } catch (invoiceError) {
          console.error('Erreur génération facture HTML:', invoiceError);

          // Fallback vers l'ancienne méthode PDF
          try {
            const fileName = InvoiceGenerator.downloadInvoice(
              saleData,
              invoiceItems,
              customerInfo,
              {}
            );

            addToast({
              title: 'Facture générée',
              message: `La facture ${fileName} a été téléchargée`,
              type: 'success',
              duration: TOAST_DURATION.MEDIUM
            });
          } catch (pdfError) {
            console.error('Erreur génération facture PDF:', pdfError);
            addToast({
              title: 'Erreur',
              message: 'Impossible de générer la facture',
              type: 'error',
              duration: TOAST_DURATION.MEDIUM
            });
          }
        }
      }

      // Snapshot des articles vendus avant reset
      const soldItems = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        libelle: item.libelle
      }));
      window.dispatchEvent(new CustomEvent('checkout', { detail: soldItems }));

      addToast({
        title: 'Succès',
        message: response.message || 'Vente créée avec succès',
        type: 'success',
        duration: TOAST_DURATION.MEDIUM
      });

      resetCartState();
      onClose?.();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Erreur lors de la création de la vente';
      
      console.error('[CartSection] ❌ Erreur lors de la validation de la vente:', errorMessage);
      
      addToast({
        title: 'Erreur',
        message: errorMessage,
        type: 'error',
        duration: TOAST_DURATION.LONG
      });
    } finally {
      // Libérer le verrou après un court délai pour éviter les clics trop rapides
      setTimeout(() => {
        setIsProcessingSale(false);
        console.log('[CartSection] 🔓 Verrou de vente libéré');
      }, 300);
    }
  }, [
    validateCart,
    cartItems,
    modifiedPrices,
    paymentMode,
    totalCost,
    printInvoice,
    customerInfo,
    addToast,
    onClose,
    isProcessingSale,
    resetCartState
  ]);

  const handleToggleView = useCallback(() => {
    setShowInvoices(!showInvoices);
  }, [showInvoices]);

  const handleShowPreview = useCallback(() => {
    setShowPreviewModal(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setShowPreviewModal(false);
  }, []);

  if (!show) return null;

  return (
    <>
      <Card
        className={`p-0 border-0 cart-section ${
          isDark ? 'bg-dark text-white' : 'bg-white'
        }`}
        style={{ 
          maxHeight: '75vh', 
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header fixe */}
        <div 
          className={`p-3 border-bottom ${
            isDark ? 'bg-dark border-secondary' : 'bg-white border-200'
          }`}
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            flexShrink: 0
          }}
        >
          <CartHeader
            showInvoices={showInvoices}
            onToggleView={handleToggleView}
          />

          {/* Alerte de validation si des quantités sont invalides */}
          {!showInvoices && cartItems.length > 0 && !hasValidQuantities && (
            <div
              className="alert alert-warning d-flex align-items-center mb-0 mt-3"
              role="alert"
            >
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              <div>
                <strong>Attention :</strong> Certaines quantités sont invalides ou
                vides. Tous les champs quantité doivent contenir un nombre entier
                positif.
              </div>
            </div>
          )}
        </div>

        {/* Contenu scrollable */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '0 1rem'
          }}
        >
          {showInvoices ? (
            <div style={{ padding: '0', height: '100%' }}>
              <InvoiceAccordion />
            </div>
          ) : (
            <div className="py-3">
              {cartItems.length === 0 ? (
                <p className="text-center py-5">Votre panier est vide.</p>
              ) : (
                <>
                  <CartTableHeader isDark={isDark} />

                  {cartItems.map((item, index) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      index={index}
                      isDark={isDark}
                      modifiedPrices={modifiedPrices}
                      onPriceChange={handlePriceChange}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                    />
                  ))}

                  <PaymentModeSelector
                    paymentModes={paymentModes}
                    paymentMode={paymentMode}
                    setPaymentMode={setPaymentMode}
                  />

                  <CartTotal
                    totalCost={totalCost}
                    isLoan={isLoan}
                    printInvoice={printInvoice}
                    setIsLoan={setIsLoan}
                    setPrintInvoice={setPrintInvoice}
                    showLoanToggle={false}
                  />

                  <CustomerInfoForm
                    isLoan={isLoan}
                    printInvoice={printInvoice}
                    customerInfo={customerInfo}
                    setCustomerInfo={setCustomerInfo}
                  />

                  <CartActions
                    onCalculator={() => setShowCalculator(true)}
                    onClose={onClose}
                    onValidate={handleValidateSale}
                    onPreview={handleShowPreview}
                    isLoan={isLoan}
                    isValidCustomer={isValidCustomer}
                    isProcessing={isProcessingSale}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </Card>

      <CalculatorModal
        show={showCalculator}
        onClose={() => setShowCalculator(false)}
        totalCost={totalCost}
      />

      <InvoicePreview
        show={showPreviewModal}
        onHide={handleClosePreview}
        saleData={{
          modePaiement: paymentMode,
          montantTotal: totalCost
        }}
        items={cartItems.map(item => ({
          ...item,
          prixVente:
            modifiedPrices[item.id] ??
            Math.floor(item.totalPrice / item.quantity),
          quantiteVendu: item.quantity
        }))}
        customerInfo={customerInfo}
        onPrint={async () => {
          try {
            const invoiceItems = cartItems.map(item => ({
              ...item,
              prixVente:
                modifiedPrices[item.id] ??
                Math.floor(item.totalPrice / item.quantity),
              quantiteVendu: item.quantity
            }));

            await printInvoiceHtml(
              {
                modePaiement: paymentMode,
                montantTotal: totalCost
              },
              invoiceItems,
              customerInfo,
              {}
            );

            handleClosePreview();
            addToast({
              title: 'Facture générée',
              message: 'La facture a été générée avec succès',
              type: 'success',
              duration: TOAST_DURATION.MEDIUM
            });
          } catch (error) {
            console.error('Erreur génération facture:', error);
            addToast({
              title: 'Erreur',
              message: 'Impossible de générer la facture',
              type: 'error',
              duration: TOAST_DURATION.MEDIUM
            });
          }
        }}
      />
    </>
  );
};

export default CartSection;
