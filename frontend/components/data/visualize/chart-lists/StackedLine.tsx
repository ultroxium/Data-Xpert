import React from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';

interface StackedLineChartProps {
  data: any;
  plotoption: string;
}

const StackedLineChart: React.FC<StackedLineChartProps> = ({ data, plotoption }) => {
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
    series: data?.dataList,
  };

  return (
    <div className="h-full w-full flex items-center justify-center">
      <ReactECharts option={option} className="h-full w-full" />
    </div>
  );
};

export default StackedLineChart;
