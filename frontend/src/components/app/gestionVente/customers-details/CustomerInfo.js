import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import IconButton from 'components/common/IconButton';
import { accountInfo, billingInfo } from 'data/ecommerce/customerDetailsData';
import classNames from 'classnames';
import createMarkup from 'helpers/createMarkup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CustomerInfo = () => {
  return (
    <Card className="mb-3 fade-in">
      <Card.Header className="bg-light">
        <Row className="align-items-center">
          <Col>
            <h5 className="mb-0 fw-bold">
              <FontAwesomeIcon icon="info-circle" className="me-2 text-primary" />
              Details
            </h5>
          </Col>
          <Col xs="auto">
            <IconButton
              iconClassName="fs-11 me-1"
              variant="falcon-default"
              size="sm"
              icon="pencil-alt"
              className="btn-primary"
            >
              <span className="d-none d-sm-inline">Update details</span>
              <span className="d-inline d-sm-none">Update</span>
            </IconButton>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="bg-body-tertiary border-top">
        <Row>
          <Col lg xxl={5}>
            <div className="d-flex align-items-center mb-3">
              <FontAwesomeIcon icon="user-circle" className="text-primary me-2" />
              <h6 className="fw-semibold ls mb-0 text-uppercase">
                Account Information
              </h6>
            </div>

            {accountInfo.map(item => (
              <Row key={item.id} className="mb-2">
                <Col xs={5} sm={4}>
                  <p className="fw-semibold mb-1 text-muted">{item.label}</p>
                </Col>
                <Col>
                  <p
                    className={classNames('mb-1', {
                      'fst-italic text-400': !item.active
                    })}
                  >
                    {item.email || item.phone ? (
                      <a
                        href={`${item.email && `mailto:`}
                        ${item.phone && `tel:`}`}
                        className="text-primary text-decoration-none"
                      >
                        {item.value}
                      </a>
                    ) : item.important ? (
                      <b className="text-success">{item.value}</b>
                    ) : (
                      item.value
                    )}
                  </p>
                </Col>
              </Row>
            ))}
          </Col>
          <Col lg xxl={{ span: 5, offset: 1 }} className="mt-4 mt-lg-0">
            <div className="d-flex align-items-center mb-3">
              <FontAwesomeIcon icon="credit-card" className="text-primary me-2" />
              <h6 className="fw-semibold ls mb-0 text-uppercase">
                Billing Information
              </h6>
            </div>

            {billingInfo.map(item => (
              <Row key={item.id} className="mb-2">
                <Col xs={5} sm={4}>
                  <p className="fw-semibold mb-1 text-muted">{item.label}</p>
                </Col>
                <Col>
                  {item.label === 'Address' ? (
                    <p
                      className={classNames('mb-1', {
                        'fst-italic text-400': !item.active
                      })}
                      dangerouslySetInnerHTML={createMarkup(item.value)}
                    ></p>
                  ) : (
                    <p
                      className={classNames('mb-1', {
                        'fst-italic text-400': !item.active
                      })}
                    >
                      {item.email || item.phone ? (
                        <a
                          href={`${item.email && `mailto:`}
                      ${item.phone && `tel:`}`}
                          className="text-primary text-decoration-none"
                        >
                          {item.value}
                        </a>
                      ) : item.important ? (
                        <b className="text-success">{item.value}</b>
                      ) : (
                        item.value
                      )}
                    </p>
                  )}
                </Col>
              </Row>
            ))}
          </Col>
        </Row>
      </Card.Body>
      <Card.Footer className="border-top text-end bg-light">
        <div className="d-flex flex-wrap gap-2 justify-content-end">
          <IconButton
            iconClassName="fs-11 me-1"
            variant="falcon-default"
            size="sm"
            icon="dollar-sign"
            className="btn-warning"
          >
            <span className="d-none d-sm-inline">Refund</span>
            <span className="d-inline d-sm-none">Remb.</span>
          </IconButton>
          <IconButton
            iconClassName="fs-11 me-1"
            variant="falcon-default"
            size="sm"
            icon="check"
            className="btn-success"
          >
            <span className="d-none d-sm-inline">Save changes</span>
            <span className="d-inline d-sm-none">Save</span>
          </IconButton>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default CustomerInfo;
