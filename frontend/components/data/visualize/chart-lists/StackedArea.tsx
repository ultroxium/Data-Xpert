import React from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';

interface StackedAreaChartProps {
  data: any;
  plotoption: string;
}

const StackedAreaChart: React.FC<StackedAreaChartProps> = ({ data, plotoption }) => {
  const option = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: data?.yLabel,
    },
    grid: {
      left: '20%',
      right: '20%',
      bottom: '20%',
      top: '20%',
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data?.xLabel,
    },
    yAxis: {
      type: 'value',
    },
    series: data?.dataList.map((series: any) => ({
      ...series,
      type: 'line',
      stack: 'total', // Stack the series
      areaStyle: {}, // Enable area style
    })),
  };

 
  return (
    <div className="h-full w-full flex items-center justify-center">
      <ReactECharts option={option} className="h-full w-full" />
    </div>
  );
};

export default StackedAreaChart;
