import React, { useEffect, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { useProductContext } from 'providers/ProductProvider';
import QuantityController from '../QuantityController';
import venteServiceV1 from 'services/vente.service.v1';
import { useToast } from '../../../common/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalculator, 
  faPrint, 
  faBox, 
  faSortNumericUp, 
  faMoneyBill, 
  faHandHoldingUsd,
  faShoppingCart,
  faTrash,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import CalculatorModal from './CalculatorModal';
import { useAppContext } from 'providers/AppProvider';
import InvoiceGenerator from '../facture/InvoiceGenerator';

const CartSection = ({ onClose, show = true }) => {
  const {
    config: { isDark }
  } = useAppContext();

  const { addToast } = useToast();
  const {
    productsState: { cartItems },
    productsDispatch
  } = useProductContext();

  const [totalCost, setTotalCost] = useState(0);
  const [modifiedPrices, setModifiedPrices] = useState({});
  const [isLoan, setIsLoan] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    phoneNumber: ''
  });
  const [paymentModes, setPaymentModes] = useState([]);
  const [paymentMode, setPaymentMode] = useState('espece');
  const [printInvoice, setPrintInvoice] = useState(false);

  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    const cost = cartItems.reduce((acc, item) => {
      const customPrice = modifiedPrices[item.id];
      const unitPrice =
        customPrice ?? parseInt(item.totalPrice / item.quantity, 10);
      return acc + unitPrice * item.quantity;
    }, 0);
    setTotalCost(cost);
  }, [cartItems, modifiedPrices]);

  useEffect(() => {
    const fetchPaymentModes = async () => {
      try {
        const response = await venteServiceV1.getPaymentModes();
        if (response && response.data) {
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

  const handlePriceChange = (productId, newPrice) => {
    setModifiedPrices(prev => ({
      ...prev,
      [productId]: newPrice
    }));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const item = cartItems.find(item => item.id === productId);
    if (item) {
      // Validation stricte de la quantité
      if (!newQuantity || 
          newQuantity <= 0 || 
          isNaN(newQuantity) || 
          !Number.isInteger(newQuantity)) {
        // Si la quantité est invalide, la remettre à 1
        productsDispatch({
          type: 'UPDATE_CART_ITEM_QUANTITY',
          payload: { productId, quantity: 1 }
        });
        return;
      }
      
      const maxQuantity = item.quantiteDisponible || Infinity;
      const validQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));
      
      // Vérifier que la quantité finale est valide
      if (validQuantity >= 1 && validQuantity <= maxQuantity) {
        productsDispatch({
          type: 'UPDATE_CART_ITEM_QUANTITY',
          payload: { productId, quantity: validQuantity }
        });
      } else {
        // Si la quantité est toujours invalide, forcer à 1
        productsDispatch({
          type: 'UPDATE_CART_ITEM_QUANTITY',
          payload: { productId, quantity: 1 }
        });
      }
    }
  };

  const handleRemoveItem = product => {
    productsDispatch({ type: 'REMOVE_FROM_CART', payload: { product } });
  };

  const validateCustomerInfo = () => {
    if (!isLoan && !printInvoice) return true;
    return (
      customerInfo.fullName.trim() !== '' &&
      customerInfo.phoneNumber.trim() !== ''
    );
  };

  const prepareCartItemsForInvoice = () => {
    return cartItems.map(item => {
      const customPrice = modifiedPrices[item.id];
      const unitPrice =
        customPrice ?? parseInt(item.totalPrice / item.quantity, 10);

      return {
        ...item,
        prixVente: unitPrice,
        quantiteVendu: item.quantity
      };
    });
  };

  const handleValidateSale = async () => {
    // Validation du panier vide
    if (!cartItems || cartItems.length === 0) {
      addToast({
        title: 'Erreur',
        message: 'Le panier est vide. Veuillez ajouter des produits.',
        type: 'error',
        duration: 5000
      });
      return;
    }

    // Validation stricte des quantités
    const invalidItems = cartItems.filter(item => {
      // Vérifier si la quantité est définie, valide et supérieure à 0
      return !item.quantity || 
             item.quantity <= 0 || 
             isNaN(item.quantity) || 
             !Number.isInteger(item.quantity) ||
             item.quantity > (item.quantiteDisponible || Infinity);
    });
    
    if (invalidItems.length > 0) {
      const invalidProductNames = invalidItems.map(item => item.libelle).join(', ');
      addToast({
        title: 'Erreur',
        message: `Quantités invalides pour : ${invalidProductNames}. Quantité minimum : 1`,
        type: 'error',
        duration: 7000
      });
      return;
    }

    if (!validateCustomerInfo()) {
      addToast({
        title: 'Erreur',
        message: 'Veuillez remplir tous les champs pour le client',
        type: 'error',
        duration: 5000
      });
      return;
    }

    const detailVenteList = cartItems.map(item => {
      const customPrice = modifiedPrices[item.id];
      const unitPrice =
        customPrice ?? parseInt(item.totalPrice / item.quantity, 10);
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
          const invoiceItems = prepareCartItemsForInvoice();
          const companyInfo = {
            name: 'Daraou Salam Boutique',
            address: 'Rio, Rifusque, Dakar, Sénégal',
            city: 'Rifusque',
            zipCode: '12345',
            phone: '+221 77 793 06 09',
            email: 'sowboubacar327@gmail.com',
            website: 'www.darousalamboutique.com'
          };

          const fileName = InvoiceGenerator.downloadInvoice(
            saleData,
            invoiceItems,
            customerInfo,
            companyInfo
          );

          addToast({
            title: 'Facture générée',
            message: `La facture ${fileName} a été téléchargée`,
            type: 'success',
            duration: 5000
          });
        } catch (invoiceError) {
          console.error(
            'Erreur lors de la génération de la facture',
            invoiceError
          );
          addToast({
            title: 'Erreur',
            message: 'Impossible de générer la facture',
            type: 'error',
            duration: 5000
          });
        }
      }

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
        duration: 5000
      });

      productsDispatch({ type: 'CHECKOUT' });
      if (onClose) onClose();
    } catch (error) {
      let errorMessage = 'Erreur lors de la création de la vente';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      addToast({
        title: 'Erreur',
        message: errorMessage,
        type: 'error',
        duration: 7000
      });
    }
  };

  if (!show) return null;

  return (
    <>
      <Card
        className={`p-3 border-0 cart-section ${isDark ? 'bg-dark text-white' : 'bg-white'}`}
        style={{ maxHeight: '75vh', overflowY: 'auto' }}
      >
        <div className="cart-header mb-3">
          <h5 className="mb-0 fw-bold">
            <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
            Votre Panier
          </h5>
        </div>

        {cartItems.length === 0 ? (
          <p>Votre panier est vide.</p>
        ) : (
          <>
            <div
              className={`row fw-bold px-2 mb-2 py-2 rounded ${
                isDark ? 'bg-dark text-white' : 'bg-light text-dark'
              }`}
            >
              <div className="col-5">
                <FontAwesomeIcon icon={faBox} className="me-1" />
                Produit
              </div>
              <div className="col-3 text-center">
                Quantité
              </div>
              <div className="col-4 text-end">
                <FontAwesomeIcon icon={faMoneyBill} className="me-1" />
                Prix
              </div>
            </div>

            {cartItems.map((item, index) => {
              const customPrice = modifiedPrices[item.id];
              const unitPrice =
                customPrice ?? parseInt(item.totalPrice / item.quantity, 10);

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
                            onClick={() => handleRemoveItem(item)}
                          >
                            <FontAwesomeIcon icon={faTrash} className="me-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>

                      <div className="col-6 col-md-3 d-flex justify-content-center">
                        <div className="quantity-wrapper">
                          <QuantityController
                            quantity={item.quantity}
                            handleIncrease={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            handleDecrease={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            handleChange={val =>
                              handleQuantityChange(item.id, val)
                            }
                            btnClassName="px-1"
                            max={item.quantiteDisponible || Infinity}
                          />
                        </div>
                      </div>

                      <div className="col-6 col-md-4 d-flex justify-content-end">
                        <div className="price-wrapper">
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
                            onChange={e =>
                              handlePriceChange(
                                item.id,
                                Math.min(
                                  parseInt(e.target.value, 10) || 0,
                                  999999
                                )
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}

            {paymentModes.length > 0 && (
              <div className="mb-3">
                <Form.Label className="fw-semibold">
                  Mode de paiement
                </Form.Label>
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
            )}

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

            {(isLoan || printInvoice) && (
              <div className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label>
                    Nom complet {isLoan ? '(Prêt)' : '(Facture)'}
                  </Form.Label>
                  <Form.Control
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
                  <Form.Label>Numéro de téléphone</Form.Label>
                  <Form.Control
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
            )}
          </>
        )}

        {cartItems.length > 0 && (
          <div className="d-flex flex-wrap gap-2 justify-content-between mt-3">
            <Button
              variant="outline-secondary"
              onClick={() => setShowCalculator(true)}
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
              onClick={handleValidateSale}
              disabled={(isLoan || printInvoice) && !validateCustomerInfo()}
              className="btn-sm"
            >
              {isLoan ? 'Valider Crédit' : 'Valider Vente'}
            </Button>
          </div>
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
