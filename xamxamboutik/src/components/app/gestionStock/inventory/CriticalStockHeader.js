import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Col } from 'react-bootstrap';
import IconButton from 'components/common/IconButton';
import { Link } from 'react-router-dom';
import DownloadStockPDF from './DownloadStockPDF';
import * as preApproService from 'services/preApproService';

const CriticalStockHeader = ({ refresh }) => {
  const [selectedProductsObject, setSelectedProductsObject] = useState({});

  useEffect(() => {
    async function loadSelection() {
      const storedSelection = await preApproService.getPreAppro();
      setSelectedProductsObject(storedSelection || {});
    }
    loadSelection();
  }, [refresh]);

  const hasSelectedProducts = Object.keys(selectedProductsObject).length > 0;

  return (
    <div className="d-lg-flex justify-content-between">
      <div className="border-bottom border-200 my-3"></div>
      <div className="d-flex align-items-center justify-content-between justify-content-lg-end px-x1">
        <Col xs={10} className="d-flex justify-content-end">
          <div id="orders-actions" className="d-flex">
            {!hasSelectedProducts ? (
              <IconButton
                variant="falcon-default"
                size="sm"
                icon="info"
                transform="shrink-3"
                iconAlign="middle"
                style={{ paddingTop: '1px', paddingBottom: '1px' }}
              >
                <span className="ms-1">Aucun produit sélectionné</span>
              </IconButton>
            ) : (
              <>
                <Link
                  to="/gestion-stock/approvisionnement/appro-details"
                  style={{ textDecoration: 'none' }}
                >
                  <IconButton
                    variant="falcon-default"
                    size="sm"
                    icon="plus"
                    transform="shrink-3"
                    iconAlign="middle"
                    style={{ paddingTop: '1px', paddingBottom: '1px' }}
                  >
                    <span className="ms-1">Valider</span>
                  </IconButton>
                </Link>
                <DownloadStockPDF selectedProducts={selectedProductsObject} />
              </>
            )}
          </div>
        </Col>
      </div>
    </div>
  );
};

CriticalStockHeader.propTypes = {
  handleShow: PropTypes.func,
  refresh: PropTypes.number
};

export default CriticalStockHeader;
