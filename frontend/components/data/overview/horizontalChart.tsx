import React from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';

interface HorizontalBarChartProps {
  xLabel: any[];
  yLabel: any[];
  color?: string;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ xLabel, yLabel, color }) => {
  const option: EChartsOption = {
    tooltip: {},
    xAxis: {
      type: 'value',
    },
    grid: {
      containLabel: true,
    },
    yAxis: {
      type: 'category',
      data: xLabel,
      axisLabel: {
        interval: 0,
      },
    },
    series: [
      {
        name: 'Value',
        type: 'bar',
        data: yLabel,
        itemStyle: {
          color: color ? color : '#E11D4890',
        },
        barWidth: '98%',
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 350 }} />;
};

export default HorizontalBarChart;
