import React from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';

interface ActualVsPredictedChartProps {
  actual: number[];
  predicted: number[];
}

const ActualVsPredictedChart: React.FC<ActualVsPredictedChartProps> = ({ actual, predicted }) => {
  const option: EChartsOption = {
    grid: {
      left: '5%',
      right: '5%',
      bottom: '5%',
      top: '20%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['Actual', 'Predicted'],
    },

    //hide x axis
    xAxis: {
      type: 'category',
      show: false,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Actual',
        type: 'line',
        data: actual,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#aaaaaa60',
        },
      },
      {
        name: 'Predicted',
        type: 'line',
        data: predicted,
        symbol: 'diamond',
        symbolSize: 8,
        itemStyle: {
          color: '#E11D4890',
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 350 }} />;
};

export default ActualVsPredictedChart;
