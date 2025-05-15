import React, { forwardRef, useEffect, useRef } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { useAppContext } from 'providers/AppProvider';

const ReactEchart = forwardRef(({ ...rest }, ref) => {
  const chartRef = ref ? ref : useRef(null);
  const {
    config: { isFluid, isNavbarVerticalCollapsed }
  } = useAppContext();

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.resize();
    }
  }, [isFluid, isNavbarVerticalCollapsed]);

  return <ReactEChartsCore ref={chartRef} {...rest} />;
});

export default ReactEchart;
