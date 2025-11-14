import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { rgbaColor } from 'helpers/utils';
import { useAppContext } from 'providers/AppProvider';
import ReactEchart from 'components/common/ReactEchart';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  LegendComponent,
  CanvasRenderer
]);

const tooltipFormatter = params => {
  const date = params[0].axisValue;
  let content = `<div class="fw-bold mb-1">${date}</div>`;

  params.forEach(({ seriesName, value, color, data }) => {
    const formattedValue = new Intl.NumberFormat('fr-FR').format(value);
    const label = seriesName === 'ca' ? "Chiffre d'affaires" : 'Bénéfice';
    const salesInfo =
      data && data.ventes
        ? ` (${data.ventes} vente${data.ventes > 1 ? 's' : ''})`
        : '';

    content += `
      <div class="d-flex align-items-center mt-1">
        <div class="dot me-2" style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%;"></div>
        <span class='text-600'>${label}: <strong>${formattedValue} CFA</strong>${salesInfo}</span>
      </div>
    `;
  });

  return content;
};

const getOptions = (getThemeColor, dates, caData, beneficeData) => ({
  color: [getThemeColor('primary'), getThemeColor('success')],
  tooltip: {
    trigger: 'axis',
    padding: [12, 15],
    backgroundColor: getThemeColor('gray-100'),
    borderColor: getThemeColor('gray-300'),
    textStyle: { color: getThemeColor('gray-1100') },
    borderWidth: 1,
    formatter: tooltipFormatter,
    transitionDuration: 0,
    axisPointer: {
      type: 'cross',
      lineStyle: {
        color: getThemeColor('gray-400'),
        type: 'dashed'
      }
    }
  },
  legend: {
    data: ["Chiffre d'affaires", 'Bénéfice'],
    bottom: 10,
    textStyle: {
      color: getThemeColor('gray-700')
    },
    itemGap: 20
  },
  xAxis: {
    type: 'category',
    data: dates,
    boundaryGap: false,
    axisPointer: {
      lineStyle: {
        color: getThemeColor('gray-300'),
        type: 'dashed'
      }
    },
    splitLine: { show: false },
    axisLine: {
      lineStyle: {
        color: getThemeColor('gray-300')
      }
    },
    axisTick: { show: false },
    axisLabel: {
      color: getThemeColor('gray-600'),
      margin: 15,
      fontSize: 11,
      fontWeight: 500
    }
  },
  yAxis: {
    type: 'value',
    axisPointer: { show: false },
    splitLine: {
      lineStyle: {
        color: getThemeColor('gray-200'),
        type: 'dashed'
      }
    },
    boundaryGap: false,
    axisLabel: {
      show: true,
      color: getThemeColor('gray-600'),
      margin: 15,
      fontSize: 11,
      formatter: value => {
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
        return value;
      }
    },
    axisTick: { show: false },
    axisLine: { show: false }
  },
  series: [
    {
      name: 'ca',
      type: 'line',
      data: caData,
      lineStyle: {
        color: getThemeColor('primary'),
        width: 3
      },
      itemStyle: {
        borderColor: getThemeColor('primary'),
        borderWidth: 3,
        backgroundColor: getThemeColor('white')
      },
      symbol: 'circle',
      symbolSize: 8,
      smooth: true,
      emphasis: {
        scale: true,
        focus: 'series'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: rgbaColor(getThemeColor('primary'), 0.25)
            },
            {
              offset: 1,
              color: rgbaColor(getThemeColor('primary'), 0.05)
            }
          ]
        }
      }
    },
    {
      name: 'benefice',
      type: 'line',
      data: beneficeData,
      lineStyle: {
        color: getThemeColor('success'),
        width: 2
      },
      itemStyle: {
        borderColor: getThemeColor('success'),
        borderWidth: 2,
        backgroundColor: getThemeColor('white')
      },
      symbol: 'circle',
      symbolSize: 6,
      smooth: true,
      emphasis: {
        scale: true,
        focus: 'series'
      }
    }
  ],
  grid: {
    right: '20px',
    left: '60px',
    bottom: '60px',
    top: '20px'
  }
});

const SalesEvolutionChart = forwardRef(({ data, loading }, ref) => {
  const { getThemeColor } = useAppContext();

  // Transformation des données
  const dates = (data || []).map(d => {
    const date = new Date(d.date);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  });

  const caData = (data || []).map(d => ({
    value: d.chiffreAffaires || 0,
    ventes: d.nombreVentes || 0
  }));

  const beneficeData = (data || []).map(d => ({
    value: d.benefice || 0,
    ventes: d.nombreVentes || 0
  }));

  const hasData = data && data.length > 0;

  // Calcul statistiques résumées
  const totalCA = caData.reduce((sum, item) => sum + item.value, 0);
  const totalBenefice = beneficeData.reduce((sum, item) => sum + item.value, 0);
  const avgCA = hasData ? totalCA / data.length : 0;

  return (
    <Card className="h-100">
      <Card.Header className="bg-body-tertiary">
        <div className="d-flex align-items-center justify-content-between">
          <h6 className="mb-0">
            <FontAwesomeIcon icon="chart-line" className="me-2 text-primary" />
            Évolution des ventes sur 7 jours
          </h6>
          {hasData && (
            <div className="d-flex gap-3 fs-11">
              <div>
                <span className="text-600">Total CA:</span>{' '}
                <span className="fw-bold text-primary">
                  {new Intl.NumberFormat('fr-FR').format(totalCA)} CFA
                </span>
              </div>
              <div>
                <span className="text-600">Moy/jour:</span>{' '}
                <span className="fw-bold text-info">
                  {new Intl.NumberFormat('fr-FR').format(avgCA)} CFA
                </span>
              </div>
            </div>
          )}
        </div>
      </Card.Header>
      <Card.Body className="pe-xxl-0">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : !hasData ? (
          <div className="text-center text-muted py-5">
            <FontAwesomeIcon
              icon="chart-line"
              size="3x"
              className="mb-3 opacity-25"
            />
            <p className="mb-0">Aucune donnée d'évolution disponible</p>
          </div>
        ) : (
          <ReactEchart
            ref={ref}
            echarts={echarts}
            option={getOptions(getThemeColor, dates, caData, beneficeData)}
            style={{ height: '300px' }}
          />
        )}
      </Card.Body>
    </Card>
  );
});

SalesEvolutionChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      chiffreAffaires: PropTypes.number,
      benefice: PropTypes.number,
      nombreVentes: PropTypes.number
    })
  ),
  loading: PropTypes.bool
};

SalesEvolutionChart.defaultProps = {
  data: [],
  loading: false
};

export default SalesEvolutionChart;
