import React from 'react';
import { Button, Card, Col, Dropdown, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from 'components/common/IconButton';
import Flex from 'components/common/Flex';
import { useAppContext } from 'providers/AppProvider';

const CustomerDetailsHeader = () => {
  const {
    config: { isRTL }
  } = useAppContext();

  return (
    <Card className="mb-3 fade-in">
      <Card.Header className="bg-light">
        <Row className="g-2 align-items-center">
          <Col>
            <h5 className="mb-2 fw-bold">
              Tony Robbins (<a href="mailto:tony@gmail.com" className="text-primary">tony@gmail.com</a>)
            </h5>
            <div className="d-flex flex-wrap gap-2">
              <IconButton
                iconClassName="fs-11 me-1"
                variant="falcon-default"
                size="sm"
                icon="plus"
                className="btn-primary"
              >
                <span className="d-none d-sm-inline">Add note</span>
                <span className="d-inline d-sm-none">Note</span>
              </IconButton>
              <Dropdown className="d-inline-block">
                <Dropdown.Toggle
                  as={Button}
                  variant="falcon-default"
                  size="sm"
                  className="dropdown-caret-none"
                >
                  <FontAwesomeIcon icon="ellipsis-h" />
                </Dropdown.Toggle>

                <Dropdown.Menu align={isRTL ? 'end' : 'start'}>
                  <Dropdown.Item as={Link} to="#!" className="d-flex align-items-center">
                    <FontAwesomeIcon icon="edit" className="me-2" />
                    Edit
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="#!" className="d-flex align-items-center">
                    <FontAwesomeIcon icon="file-alt" className="me-2" />
                    Report
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="#!" className="d-flex align-items-center">
                    <FontAwesomeIcon icon="archive" className="me-2" />
                    Archive
                  </Dropdown.Item>
                  <Dropdown.Divider as="div" />
                  <Dropdown.Item as={Link} to="#!" className="text-danger d-flex align-items-center">
                    <FontAwesomeIcon icon="trash" className="me-2" />
                    Delete user
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Col>
          <Col xs="auto">
            <div className="d-flex align-items-center">
              <h6 className="text-uppercase text-600 mb-0 me-2">
                Customer
              </h6>
              <FontAwesomeIcon icon="user" className="text-primary" />
            </div>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="border-top bg-light">
        <Flex className="align-items-start">
          <div className="bg-success rounded-circle p-2 me-3">
            <FontAwesomeIcon
              icon="user"
              className="text-white"
              transform="down-5"
            />
          </div>
          <div className="flex-1">
            <p className="mb-1 fw-semibold">Customer was created</p>
            <p className="fs-10 mb-0 text-600">
              <FontAwesomeIcon icon="clock" className="me-1" />
              Jan 12, 11:13 PM
            </p>
          </div>
        </Flex>
      </Card.Body>
    </Card>
  );
};

export default CustomerDetailsHeader;
