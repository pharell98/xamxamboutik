import React from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flex from 'components/common/Flex';
import { PieChart } from 'echarts/charts';
import * as echarts from 'echarts/core';
import BasicECharts from 'components/common/BasicEChart';
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useAppContext } from 'providers/AppProvider';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer
]);

// Mapping couleurs par mode de paiement
const colorMap = {
  espece: 'primary',
  orange_money: 'success',
  wave: 'warning',
  cart_bancaire: 'info'
};

// Mapping libellés en français
const labelMap = {
  espece: 'Espèce',
  orange_money: 'Orange Money',
  wave: 'Wave',
  cart_bancaire: 'Carte bancaire'
};

const getOptions = (getThemeColor, data) => ({
  color: data.map(item => getThemeColor(item.color)),
  tooltip: {
    trigger: 'item',
    padding: [7, 10],
    backgroundColor: getThemeColor('gray-100'),
    borderColor: getThemeColor('gray-300'),
    textStyle: { color: getThemeColor('gray-1100') },
    borderWidth: 1,
    formatter: params => {
      const amount = params.data.amount || 0;
      const formattedAmount = new Intl.NumberFormat('fr-FR').format(amount);
      return `<strong>${params.data.name}</strong><br/>
              Montant: ${formattedAmount} CFA<br/>
              Part: ${params.percent.toFixed(1)}%<br/>
              Ventes: ${params.data.salesCount || 0}`;
    },
    transitionDuration: 0
  },
  legend: {
    show: false
  },
  series: [
    {
      type: 'pie',
      radius: ['50%', '70%'], // Donut chart
      avoidLabelOverlap: false,
      emphasis: {
        scale: true,
        scaleSize: 10,
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      itemStyle: {
        borderWidth: 2,
        borderColor: getThemeColor('gray-100'),
        borderRadius: 4
      },
      label: {
        show: false
      },
      labelLine: {
        show: false
      },
      data: data.map(item => ({
        value: item.value,
        name: item.name,
        amount: item.amount,
        salesCount: item.salesCount
      }))
    }
  ]
});

const PaymentModeItem = ({ item, index, total }) => {
  const { name, color, value, salesCount } = item;
  const percentage = total > 0 ? ((value * 100) / total).toFixed(1) : 0;
  const formattedAmount = new Intl.NumberFormat('fr-FR').format(value);

  return (
    <Flex
      alignItems="center"
      justifyContent="between"
      className={`fw-semibold fs-10 ${index === 0 ? 'mt-2' : 'mt-1'}`}
    >
      <div className="d-flex align-items-center">
        <FontAwesomeIcon
          icon="circle"
          className={`me-2 text-${color}`}
          style={{ fontSize: '0.75rem' }}
        />
        <span>{name}</span>
      </div>
      <div className="d-flex flex-column align-items-end">
        <span className="text-900">{percentage}%</span>
        <span className="text-500 fs-11">{formattedAmount} CFA</span>
        <span className="text-400 fs-11">{salesCount} vente(s)</span>
      </div>
    </Flex>
  );
};

const PaymentModeChart = ({ data, loading }) => {
  const { getThemeColor } = useAppContext();

  // Transformer les données backend vers format graphique
  const transformedData = (data || []).map(item => ({
    name: labelMap[item.modePaiement] || item.modePaiement,
    color: colorMap[item.modePaiement] || 'secondary',
    value: item.montant || 0,
    amount: item.montant || 0,
    salesCount: item.nombreVentes || 0
  }));

  const total = transformedData.reduce((acc, item) => acc + item.value, 0);
  const hasData = transformedData.length > 0 && total > 0;

  return (
    <Card className="h-100">
      <Card.Header className="bg-body-tertiary">
        <h6 className="mb-0">
          <FontAwesomeIcon icon="credit-card" className="me-2 text-primary" />
          Répartition des paiements
        </h6>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : !hasData ? (
          <div className="text-center text-muted py-5">
            <FontAwesomeIcon
              icon="chart-pie"
              size="3x"
              className="mb-3 opacity-25"
            />
            <p className="mb-0">Aucune donnée disponible</p>
          </div>
        ) : (
          <Row className="justify-content-between g-0">
            <Col xs={12} sm={7} className="pe-2">
              <div className="mb-3">
                <h6 className="text-600 fs-11 mb-2">Total des ventes</h6>
                <h4 className="text-900 mb-0">
                  {new Intl.NumberFormat('fr-FR').format(total)} CFA
                </h4>
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {transformedData.map((item, index) => (
                  <PaymentModeItem
                    key={item.name}
                    item={item}
                    index={index}
                    total={total}
                  />
                ))}
              </div>
            </Col>
            <Col
              xs={12}
              sm={5}
              className="d-flex align-items-center justify-content-center"
            >
              <div className="ps-0">
                <BasicECharts
                  echarts={echarts}
                  options={getOptions(getThemeColor, transformedData)}
                  style={{ width: '180px', height: '180px' }}
                />
              </div>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};

PaymentModeItem.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    salesCount: PropTypes.number
  }),
  index: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired
};

PaymentModeChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      modePaiement: PropTypes.string,
      montant: PropTypes.number,
      pourcentage: PropTypes.number,
      nombreVentes: PropTypes.number
    })
  ),
  loading: PropTypes.bool
};

PaymentModeChart.defaultProps = {
  data: [],
  loading: false
};

export default PaymentModeChart;
