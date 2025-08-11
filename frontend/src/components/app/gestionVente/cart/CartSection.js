import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  faList,
  faReceipt
} from '@fortawesome/free-solid-svg-icons';

import { useProductContext } from 'providers/ProductProvider';
import { useToast } from '../../../common/Toast';
import { useAppContext } from 'providers/AppProvider';
import venteServiceV1 from 'services/vente.service.v1';
import InvoiceGenerator from '../facture/InvoiceGenerator';
import QuantityController from '../QuantityController';
import CalculatorModal from './CalculatorModal';
import Sales from '../allSales/Sales';

// Constants
const COMPANY_INFO = {
  name: 'Daraou Salam Boutique',
  address: 'Rio, Rifusque, Dakar, Sénégal',
  city: 'Rifusque',
  zipCode: '12345',
  phone: '+221 77 793 06 09',
  email: 'sowboubacar327@gmail.com',
  website: 'www.darousalamboutique.com'
};

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
        console.error('Erreur lors de la récupération des modes de paiement', error);
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
      const unitPrice = customPrice ?? Math.floor(item.totalPrice / item.quantity);
      return acc + unitPrice * item.quantity;
    }, 0);

    return { totalCost };
  }, [cartItems, modifiedPrices]);
};

// Components
const CartHeader = ({ showSales, onToggleView }) => (
  <div className="cart-header mb-3 d-flex justify-content-between align-items-center">
    <h5 className="mb-0 fw-bold">
      <FontAwesomeIcon icon={showSales ? faReceipt : faShoppingCart} className="me-2" />
      {showSales ? 'Historique des Ventes' : 'Votre Panier'}
    </h5>
    <Button
      variant="outline-primary"
      size="sm"
      onClick={onToggleView}
      className="d-flex align-items-center gap-2"
      title={showSales ? 'Afficher le panier' : 'Afficher les ventes'}
    >
      <FontAwesomeIcon icon={showSales ? faShoppingCart : faList} />
      {showSales ? 'Panier' : 'Ventes'}
    </Button>
  </div>
);

const CartTableHeader = ({ isDark }) => (
  <div className={`row fw-bold px-2 mb-2 py-2 rounded ${
    isDark ? 'bg-dark text-white' : 'bg-light text-dark'
  }`}>
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
              handleIncrease={() => onQuantityChange(item.id, item.quantity + 1)}
              handleDecrease={() => onQuantityChange(item.id, item.quantity - 1)}
              handleChange={val => onQuantityChange(item.id, val)}
              btnClassName="px-1"
              max={item.quantiteDisponible || Infinity}
            />
          </div>

          <div className="col-6 col-md-4 d-flex justify-content-end">
            <Form.Control
              type="number"
              min="0"
              max="999999"
              step="1"
              className="text-end input-spin-none"
              style={{ 
                width: '100px',
                WebkitAppearance: 'none',
                MozAppearance: 'textfield',
                appearance: 'none'
              }}
              value={unitPrice}
              onChange={e => onPriceChange(
                item.id,
                Math.min(parseInt(e.target.value, 10) || 0, 999999)
              )}
            />
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

const CartTotal = ({ totalCost, isLoan, printInvoice, setIsLoan, setPrintInvoice }) => (
  <div className="cart-total d-flex align-items-center justify-content-between mb-2 p-3 rounded">
    <div className="d-flex flex-wrap gap-3">
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
      Total <span className="ms-2 text-primary">XOF {totalCost.toLocaleString()}</span>
    </h5>
  </div>
);

const CustomerInfoForm = ({ isLoan, printInvoice, customerInfo, setCustomerInfo }) => {
  if (!isLoan && !printInvoice) return null;

  return (
    <div className="mt-3">
      <Form.Group className="mb-3">
        <Form.Label>
          Nom complet {isLoan ? '(Prêt)' : '(Facture)'}
        </Form.Label>
        <Form.Control
          type="text"
          placeholder="Entrez le nom complet"
          value={customerInfo.fullName}
          onChange={e => setCustomerInfo(prev => ({
            ...prev,
            fullName: e.target.value
          }))}
          required
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Numéro de téléphone</Form.Label>
        <Form.Control
          type="tel"
          placeholder="Ex: 77 123 45 67"
          value={customerInfo.phoneNumber}
          onChange={e => setCustomerInfo(prev => ({
            ...prev,
            phoneNumber: e.target.value
          }))}
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
  isLoan, 
  isValidCustomer 
}) => (
  <div className="d-flex flex-wrap gap-2 justify-content-between mt-3">
    <Button
      variant="outline-secondary"
      onClick={onCalculator}
      className="btn-sm"
    >
      <FontAwesomeIcon icon={faCalculator} className="me-1" />
      <span className="d-none d-sm-inline">Calculatrice</span>
      <span className="d-inline d-sm-none">Calc</span>
    </Button>

    {onClose && (
      <Button variant="secondary" onClick={onClose} className="btn-sm">
        <FontAwesomeIcon icon={faTimes} className="me-1" />
        <span className="d-none d-sm-inline">Fermer</span>
        <span className="d-inline d-sm-none">X</span>
      </Button>
    )}

    <Button
      variant="success"
      onClick={onValidate}
      disabled={!isValidCustomer}
      className="btn-sm"
    >
      {isLoan ? 'Valider Crédit' : 'Valider Vente'}
    </Button>
  </div>
);

// Main component
const CartSection = ({ onClose, show = true }) => {
  const { config: { isDark } } = useAppContext();
  const { addToast } = useToast();
  const { productsState: { cartItems }, productsDispatch } = useProductContext();

  // State
  const [modifiedPrices, setModifiedPrices] = useState({});
  const [isLoan, setIsLoan] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ fullName: '', phoneNumber: '' });
  const [paymentMode, setPaymentMode] = useState('espece');
  const [printInvoice, setPrintInvoice] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showSales, setShowSales] = useState(false);

  // Custom hooks
  const paymentModes = usePaymentModes();
  const { totalCost } = useCartCalculations(cartItems, modifiedPrices);

  // Validation
  const isValidCustomer = useMemo(() => {
    if (!isLoan && !printInvoice) return true;
    return customerInfo.fullName.trim() !== '' && customerInfo.phoneNumber.trim() !== '';
  }, [isLoan, printInvoice, customerInfo]);

  // Handlers
  const handlePriceChange = useCallback((productId, newPrice) => {
    setModifiedPrices(prev => ({ ...prev, [productId]: newPrice }));
  }, []);

  const handleQuantityChange = useCallback((productId, newQuantity) => {
    const item = cartItems.find(item => item.id === productId);
    if (!item) return;

    // Validation
    if (!newQuantity || newQuantity <= 0 || !Number.isInteger(newQuantity)) {
      newQuantity = 1;
    }

    const maxQuantity = item.quantiteDisponible || Infinity;
    const validQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));

    productsDispatch({
      type: 'UPDATE_CART_ITEM_QUANTITY',
      payload: { productId, quantity: validQuantity }
    });
  }, [cartItems, productsDispatch]);

  const handleRemoveItem = useCallback((product) => {
    productsDispatch({ type: 'REMOVE_FROM_CART', payload: { product } });
  }, [productsDispatch]);

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

    const invalidItems = cartItems.filter(item => 
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

  const handleValidateSale = useCallback(async () => {
    if (!validateCart()) return;

    const detailVenteList = cartItems.map(item => {
      const customPrice = modifiedPrices[item.id];
      const unitPrice = customPrice ?? Math.floor(item.totalPrice / item.quantity);
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

      if (printInvoice) {
        try {
          const invoiceItems = cartItems.map(item => ({
            ...item,
            prixVente: modifiedPrices[item.id] ?? Math.floor(item.totalPrice / item.quantity),
            quantiteVendu: item.quantity
          }));

          const fileName = InvoiceGenerator.downloadInvoice(
            saleData,
            invoiceItems,
            customerInfo,
            COMPANY_INFO
          );

          addToast({
            title: 'Facture générée',
            message: `La facture ${fileName} a été téléchargée`,
            type: 'success',
            duration: TOAST_DURATION.MEDIUM
          });
        } catch (invoiceError) {
          console.error('Erreur génération facture:', invoiceError);
          addToast({
            title: 'Erreur',
            message: 'Impossible de générer la facture',
            type: 'error',
            duration: TOAST_DURATION.MEDIUM
          });
        }
      }

      // Notify other components
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

      productsDispatch({ type: 'CHECKOUT' });
      onClose?.();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la création de la vente';
      addToast({
        title: 'Erreur',
        message: errorMessage,
        type: 'error',
        duration: TOAST_DURATION.LONG
      });
    }
  }, [validateCart, cartItems, modifiedPrices, paymentMode, totalCost, printInvoice, customerInfo, addToast, productsDispatch, onClose]);

  if (!show) return null;

  return (
    <>
      <Card
        className={`p-3 border-0 cart-section ${isDark ? 'bg-dark text-white' : 'bg-white'}`}
        style={{ maxHeight: '75vh', overflowY: 'auto' }}
      >
        <CartHeader 
          showSales={showSales} 
          onToggleView={() => setShowSales(!showSales)} 
        />

        {showSales ? (
          <Sales />
        ) : (
          <>
            {cartItems.length === 0 ? (
              <p>Votre panier est vide.</p>
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
                />

                <CustomerInfoForm
                  isLoan={isLoan}
                  printInvoice={printInvoice}
                  customerInfo={customerInfo}
                  setCustomerInfo={setCustomerInfo}
                />
              </>
            )}

            {cartItems.length > 0 && (
              <CartActions
                onCalculator={() => setShowCalculator(true)}
                onClose={onClose}
                onValidate={handleValidateSale}
                isLoan={isLoan}
                isValidCustomer={isValidCustomer}
              />
            )}
          </>
        )}
      </Card>

      <CalculatorModal
        show={showCalculator}
        onClose={() => setShowCalculator(false)}
        totalCost={totalCost}
      />
    </>
  );
};

export default CartSection;