import React from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Row } from 'react-bootstrap';
import Flex from 'components/common/Flex';
import SubtleBadge from 'components/common/SubtleBadge';

const EcomStatItem = ({ stat }) => {
  return (
    <Col xs={6} md={4} className={stat.className}>
      <h6 className="pb-1 text-700">{stat.title}</h6>
      <Flex alignItems="center" justifyContent="between">
        <p className="font-sans-serif lh-1 mb-1 fs-7">{stat.amount}</p>
        {typeof stat.percent !== 'undefined' && (
          <SubtleBadge bg={Number(stat.percent) >= 0 ? 'success' : 'danger'}>
            {stat.percent}%
          </SubtleBadge>
        )}
      </Flex>
      {stat.subAmount && <p className="mb-0 text-500 fs-9">{stat.subAmount}</p>}
    </Col>
  );
};

EcomStatItem.propTypes = {
  stat: PropTypes.shape({
    title: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    subAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string,
    percent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    className: PropTypes.string
  }),
  index: PropTypes.number,
  lastIndex: PropTypes.number
};

const EcomStat = ({ data }) => {
  return (
    <Card className="py-3 mb-3">
      <Card.Body className="py-3">
        <Row className="g-0">
          {data.map((stat, index) => (
            <EcomStatItem
              key={stat.title}
              stat={stat}
              index={index}
              lastIndex={data.length - 1}
            />
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
};

EcomStat.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default EcomStat;
