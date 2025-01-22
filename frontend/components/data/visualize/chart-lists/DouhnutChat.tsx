import React from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';

interface DoughnutChartProps {
  data: any[];
  xLabel?: string;
}

const Doughnut: React.FC<DoughnutChartProps> = ({ data, xLabel }) => {
  const option = {
    grid: {
      // left: '20%',
      // right: '20%',
      // bottom: '20%',
      // top: '20%',
      show: false,
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
    legend: {
      top: '0%',
      left: 'center',
    },
    series: [
      {
        name: xLabel,
        type: 'pie',
        radius: ['30%', '60%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: data,
      },
    ],
  };

  return (
    <div className="h-full w-full flex items-center justify-center">
      <ReactECharts option={option} className="h-full w-full" />
    </div>
  );
};

export default Doughnut;
