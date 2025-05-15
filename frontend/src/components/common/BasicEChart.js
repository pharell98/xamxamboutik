import merge from 'lodash.merge';
import PropTypes from 'prop-types';
import { useAppContext } from 'providers/AppProvider';
import React from 'react';
import ReactEchart from './ReactEchart';

const getOption = getThemeColor => ({
  color: getThemeColor('primary'),
  tooltip: {
    trigger: 'item',
    axisPointer: {
      type: 'none'
    },
    padding: [7, 10],
    backgroundColor: getThemeColor('gray-100'),
    borderColor: getThemeColor('gray-100'),
    textStyle: { color: getThemeColor('gray-1100') },
    borderWidth: 1,
    transitionDuration: 0
  },
  xAxis: {
    type: 'category',
    show: false,
    boundaryGap: false
  },
  yAxis: {
    show: false,
    type: 'value',
    boundaryGap: false
  },
  series: [
    {
      type: 'bar',
      symbol: 'none'
    }
  ],
  grid: { right: '0', left: '0', bottom: '0', top: '0' }
});

const BasicECharts = ({ echarts, options, ...rest }) => {
  const { getThemeColor } = useAppContext();
  return (
    <ReactEchart
      echarts={echarts}
      option={merge(getOption(getThemeColor), options)}
      {...rest}
    />
  );
};

BasicECharts.propTypes = {
  echarts: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired
};

export default BasicECharts;
