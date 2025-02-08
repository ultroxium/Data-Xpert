import React from 'react';
import ReactECharts from 'echarts-for-react';

interface HeatMapPlotProps {
  data: any;
  plotoption: string;
  color?: string;
}

const HeatMapPlot: React.FC<HeatMapPlotProps> = ({ data, plotoption,color }) => {
  const dataset = data?.dataList?.map(function (item) {
    return [item[1], item[0], item[2] || '-'];
  });
  const option = {
    tooltip: {
      position: 'top',
    },
    grid: {
      // left: '10%',
      // right: '10%',
      // bottom: '20%',
      // top: '10%',
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },

    xAxis: {
      type: 'category',
      data: data?.xLabel,
      splitArea: {
        show: true,
      },
    },
    yAxis: {
      type: 'category',
      data: data?.yLabel,
      splitArea: {
        show: true,
      },
    },
    visualMap: {
      min: data?.min,
      max: data?.max,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
    },
    series: [
      {
        name: plotoption,
        type: 'heatmap',
        data: dataset,
        label: {
          show: true,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
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

export default HeatMapPlot;
