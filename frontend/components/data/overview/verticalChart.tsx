import React from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';

interface ChartData {
  name: string;
  value: number;
}

interface VerticalBarChartProps {
  xLabel: any[];
  yLabel: any[];
  color?: string;
}

const VerticalBarChart: React.FC<VerticalBarChartProps> = ({ xLabel, yLabel,color }) => {
  const option: EChartsOption = {
    tooltip: {},
    xAxis: {
      type: 'category',
      data: xLabel,
      axisLabel: {
        rotate: 45,
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
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

  return <ReactECharts option={option} style={{ height: 320 }} />;
};

export default VerticalBarChart;
