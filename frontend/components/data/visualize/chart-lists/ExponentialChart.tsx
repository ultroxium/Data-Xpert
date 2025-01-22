import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import * as ecStat from 'echarts-stat';

interface ExponentialChartChartProps {
  data: number[][];
  xLabel?: string;
  yLabel?: string;
}

const ExponentialChart: React.FC<ExponentialChartChartProps> = ({ data, xLabel, yLabel }) => {
  echarts.registerTransform(ecStat["transform"].regression);
  const option = {
    dataset: [
      {
        source: data,
      },
      {
        transform: {
          type: 'ecStat:regression',
          config: { method: 'exponential' },
        },
      },
    ],
    grid: {
      left: '20%',
      right: '20%',
      bottom: '20%',
      top: '20%',
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },

    legend: {
      bottom: 5,
    },
    tooltip: {
      trigger: 'axis',

      axisPointer: {
        type: 'cross',
      },
    },
    xAxis: {
      name: xLabel,
      nameLocation: 'middle',
      nameTextStyle: {
        fontWeight: 'bold',
        fontSize: 12,
        padding: 10,
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#aaaaaa30',
        },
      },
    },
    yAxis: {
      name: yLabel,
      nameLocation: 'end',
      nameTextStyle: {
        fontWeight: 'bold',
        fontSize: 12,
        padding: 10,
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#aaaaaa30',
        },
      },
    },

    dataZoom: [
      {
        type: 'inside', // Enable zooming using the mouse wheel and dragging
        xAxisIndex: 0, // Apply to the x-axis
        yAxisIndex: 0, // Apply to the y-axis
      },
      // {
      //   type: 'slider', // Enable zooming using a slider
      //   xAxisIndex: 0, // Apply to the x-axis
      //   yAxisIndex: 0, // Apply to the y-axis
      // },
    ],

    series: [
      {
        name: 'scatter',
        type: 'scatter',
        datasetIndex: 0,
      },
      {
        name: 'line',
        type: 'line',
        smooth: true,
        datasetIndex: 1,
        symbolSize: 0.1,
        symbol: 'circle',
        label: { show: true, fontSize: 16 },
        labelLayout: { dx: -20 },
        encode: { label: 2, tooltip: 1 },
      },
    ],
  };

  return (
    <div className="h-full w-full flex items-center justify-center">
      <ReactECharts option={option} className="h-full w-full" />
    </div>
  );
};

export default ExponentialChart;
