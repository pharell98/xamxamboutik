import React from 'react';
import PropTypes from 'prop-types';
import { Badge, Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flex from 'components/common/Flex';
import { Link } from 'react-router-dom';
import { useAppContext } from 'providers/AppProvider';

const StockAlertsWidget = ({ alerts, loading }) => {
  const {
    config: { isDark }
  } = useAppContext();

  const totalAlerts =
    (alerts?.produitsEnRupture || 0) + (alerts?.produitsAlerteCritique || 0);
  const hasAlerts = totalAlerts > 0;

  const alertItems = [
    {
      label: 'Rupture totale',
      count: alerts?.produitsEnRupture || 0,
      icon: 'exclamation-circle',
      color: 'danger',
      bgColor: isDark ? 'rgba(220, 53, 69, 0.15)' : 'rgba(220, 53, 69, 0.1)',
      description: 'Stock épuisé (0 unités)'
    },
    {
      label: 'Alerte critique',
      count: alerts?.produitsAlerteCritique || 0,
      icon: 'exclamation-triangle',
      color: 'warning',
      bgColor: isDark ? 'rgba(255, 193, 7, 0.15)' : 'rgba(255, 193, 7, 0.1)',
      description: 'Stock très bas (≤ seuil/2)'
    }
  ];

  return (
    <Card className="h-100">
      <Card.Header
        className={`${
          isDark ? 'bg-dark border-secondary' : 'bg-body-tertiary'
        }`}
      >
        <Flex alignItems="center" justifyContent="between">
          <h6 className="mb-0">
            <FontAwesomeIcon icon="warehouse" className="me-2 text-warning" />
            Alertes Stock
          </h6>
          {hasAlerts && (
            <Badge bg="danger" pill className="fs-11 px-2">
              {totalAlerts}
            </Badge>
          )}
        </Flex>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : (
          <>
            <style>
              {`
                .alert-item {
                  transition: all 0.3s ease;
                  border-radius: 10px;
                  cursor: pointer;
                }
                .alert-item:hover {
                  transform: translateX(5px);
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .pulse-animation {
                  animation: pulse 2s ease-in-out infinite;
                }
                @keyframes pulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.6; }
                }
              `}
            </style>

            {!hasAlerts ? (
              <div className="text-center text-success py-4">
                <FontAwesomeIcon
                  icon="check-circle"
                  size="3x"
                  className="mb-3"
                />
                <p className="mb-0 fw-semibold">Aucune alerte stock</p>
                <p className="text-500 fs-11 mb-0">
                  Tous les produits sont bien approvisionnés
                </p>
              </div>
            ) : (
              <div className="mb-3">
                {alertItems.map((item, index) => (
                  <div
                    key={item.label}
                    className={`alert-item p-3 ${index > 0 ? 'mt-3' : ''}`}
                    style={{
                      backgroundColor: item.bgColor,
                      border: `1px solid ${
                        isDark
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.05)'
                      }`
                    }}
                  >
                    <Flex alignItems="center" justifyContent="between">
                      <div className="d-flex align-items-center">
                        <div
                          className={`${
                            item.count > 0 ? 'pulse-animation' : ''
                          }`}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isDark
                              ? `rgba(255, 255, 255, 0.1)`
                              : 'white',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <FontAwesomeIcon
                            icon={item.icon}
                            className={`text-${item.color}`}
                            size="lg"
                          />
                        </div>
                        <div className="ms-3">
                          <h6 className="mb-0 fs-10 fw-bold">{item.label}</h6>
                          <p className="mb-0 text-500 fs-11">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`fs-3 fw-bold text-${item.color}`}
                          style={{ lineHeight: 1 }}
                        >
                          {item.count}
                        </div>
                        <div className="text-500 fs-11">
                          produit{item.count > 1 ? 's' : ''}
                        </div>
                      </div>
                    </Flex>
                  </div>
                ))}
              </div>
            )}

            {hasAlerts && (
              <div className="text-center mt-4">
                <Link to="/e-commerce/product/product-list">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="w-100"
                    style={{
                      borderRadius: '8px',
                      fontWeight: 600,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <FontAwesomeIcon icon="boxes" className="me-2" />
                    Voir les produits en alerte
                  </Button>
                </Link>
              </div>
            )}

            <div
              className={`mt-3 p-2 rounded text-center fs-11 ${
                isDark ? 'bg-dark' : 'bg-light'
              }`}
            >
              <FontAwesomeIcon icon="info-circle" className="me-2 text-info" />
              <span className="text-600">
                {hasAlerts
                  ? 'Réapprovisionner rapidement pour éviter les ruptures'
                  : 'Stock surveillé en temps réel'}
              </span>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

StockAlertsWidget.propTypes = {
  alerts: PropTypes.shape({
    produitsEnRupture: PropTypes.number,
    produitsAlerteCritique: PropTypes.number
  }),
  loading: PropTypes.bool
};

StockAlertsWidget.defaultProps = {
  alerts: {
    produitsEnRupture: 0,
    produitsAlerteCritique: 0
  },
  loading: false
};

export default StockAlertsWidget;
