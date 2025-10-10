import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import IconButton from 'components/common/IconButton';
import { logs } from 'data/ecommerce/customerDetailsData';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CustomerLog = () => {
  return (
    <Card className="fade-in">
      <Card.Header className="bg-light">
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon="history" className="text-primary me-2" />
          <h5 className="mb-0 fw-bold">Logs</h5>
        </div>
      </Card.Header>
      <Card.Body className="border-top p-0">
        {logs.map((log, index) => (
          <Row
            key={log.id}
            className={classNames(
              'g-0 align-items-center border-bottom py-2 px-3 fade-in',
              {
                'bg-light': index % 2 === 0
              }
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Col md="auto" className="pe-3">
              <span
                className={classNames('badge rounded-pill', {
                  'badge-subtle-success': log.status === 200,
                  'badge-subtle-danger': log.status === 404,
                  'badge-subtle-warning': log.status === 400
                })}
              >
                <FontAwesomeIcon
                  icon={
                    log.status === 200
                      ? 'check'
                      : log.status === 404
                      ? 'times'
                      : 'exclamation-triangle'
                  }
                  className="me-1"
                />
                {log.status}
              </span>
            </Col>
            <Col md className="mt-1 mt-md-0">
              <code className="bg-light px-2 py-1 rounded">
                <FontAwesomeIcon icon="code" className="me-1 text-muted" />
                {log.reqType} {log.path}
              </code>
            </Col>
            <Col md="auto">
              <p className="mb-0 text-muted">
                <FontAwesomeIcon icon="clock" className="me-1" />
                {log.date} {log.time}
              </p>
            </Col>
          </Row>
        ))}
      </Card.Body>
      <Card.Footer className="bg-body-tertiary p-0">
        <IconButton
          variant="link"
          iconClassName="fs-11 ms-1"
          icon="chevron-right"
          className="d-block w-100 text-primary"
          iconAlign="right"
          as={Link}
          to="#!"
        >
          <span className="d-none d-sm-inline">View more logs</span>
          <span className="d-inline d-sm-none">More logs</span>
        </IconButton>
      </Card.Footer>
    </Card>
  );
};

export default CustomerLog;
