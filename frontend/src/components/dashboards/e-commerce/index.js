import React from 'react';
import { Col, Row } from 'react-bootstrap';
import EcomStat from './EcomStat';
import BeneficeCard from './benefices/BeneficeCard';
import TotalSales from './totalsales/TotalSales';
import {
  marketShare,
  notifications,
  saleItems,
  totalSale
} from 'data/dashboard/ecom';
import MarketShare from 'components/dashboards/default/MarketShare';

const Ecommerce = () => {
  return (
    <>
      <Row className="g-3 mb-3">
        <Col xxl={6} xl={12}>
          <Row className="g-3">
            <Col xs={12}>
              <BeneficeCard notifications={notifications} />
            </Col>
            <Col lg={12}>
              <Row className="g-3">
                <Col md={6}>
                  <MarketShare data={marketShare} radius={['100%', '80%']} />
                </Col>
                <Col md={6}>
                  <MarketShare data={marketShare} radius={['100%', '80%']} />
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
        <Col xxl={6} xl={12}>
          <EcomStat data={saleItems} />
          <TotalSales data={totalSale} />
        </Col>
      </Row>
    </>
  );
};

export default Ecommerce;
