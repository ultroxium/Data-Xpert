import React from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';

interface CustomizedPieChartProps {
  data: any[];
  xLabel?: string;
}

const CustomizedPie: React.FC<CustomizedPieChartProps> = ({ data, xLabel }) => {
  const option = {
    backgroundColor: 'transparent',
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
    tooltip: {
      trigger: 'item',
    },
    visualMap: {
      show: false,
      min: 80,
      max: 600,
      inRange: {
        colorLightness: [0, 1],
      },
    },
    series: [
      {
        name: xLabel,
        type: 'pie',
        radius: '55%',
        center: ['50%', '50%'],
        data: data.sort(function (a, b) {
          return a.value - b.value;
        }),
        roseType: 'radius',
        label: {
          color: '#888',
        },
        labelLine: {
          lineStyle: {
            color: '#888',
          },
          smooth: 0.2,
          length: 10,
          length2: 20,
        },
        itemStyle: {
          color: '#e11d47c0',
          shadowBlur: 300,
          shadowColor: 'rgba(231, 102, 51, 0.9)',
        },
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function () {
          return Math.random() * 200;
        },
      },
    ],
  };

  return (
    <div className="h-full w-full flex items-center justify-center">
      <ReactECharts option={option} className="h-full w-full" />
    </div>
  );
};

export default CustomizedPie;
