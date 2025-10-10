import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';
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
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center w-100">
      <div className="border-bottom border-200 my-1 my-md-2 w-100"></div>
      <div className="d-flex align-items-center justify-content-between justify-content-md-end w-100">
        <Col
          xs={12}
          className="d-flex justify-content-center justify-content-md-end px-0"
        >
          <div id="orders-actions" className="d-flex flex-wrap gap-1">
            {!hasSelectedProducts ? (
              <IconButton
                variant="falcon-default"
                size="sm"
                icon="info"
                transform="shrink-3"
                iconAlign="middle"
                className="px-1 py-1"
              >
                <span className="ms-1 d-none d-sm-inline">
                  Aucun produit sélectionné
                </span>
                <span className="ms-1 d-inline d-sm-none">Aucun produit</span>
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
                    className="px-1 py-1"
                  >
                    <span className="ms-1 d-none d-sm-inline">Valider</span>
                    <span className="ms-1 d-inline d-sm-none">OK</span>
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
