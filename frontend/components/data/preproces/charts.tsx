import { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import React from 'react';

interface VerticalBarChartProps {
  xLabel: any[];
  yLabel: any[];
}

export const DistributionChart: React.FC<VerticalBarChartProps> = ({ xLabel, yLabel }) => {
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
      splitLine: {
        lineStyle: {
          color: 'none',
        },
      },
    },
    series: [
      {
        name: 'Value',
        type: 'bar',
        data: yLabel,
        itemStyle: {
          color: '#3b82f690',
        },
        barWidth: '100%',
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 320 }} />;
};

interface CorellationMatrixChartProps {
  data: any;
}

export const CorellationChart: React.FC<CorellationMatrixChartProps> = ({ data }) => {
  if (!data || !data.data || !data.xLabel || !data.yLabel) {
    return <div>Error: Data not available</div>;
  }

  const dataset = data.data.map((item) => [item[1], item[0], item[2] || '-']);
  const option = {
    tooltip: { position: 'top' },
    grid: { left: '5%', right: '15%', bottom: '5%', top: '5%', containLabel: true },
    toolbox: { feature: { saveAsImage: {} } },
    xAxis: { type: 'category', data: data.xLabel, splitArea: { show: true } },
    yAxis: { type: 'category', data: data.yLabel, splitArea: { show: true } },
    visualMap: {
      min: data.minValue || 0,
      max: data.maxValue || 1,
      calculable: true,
      orient: 'vertical',
      bottom: '30%',
      right: '5%',
      inRange: { color: ['#ffffff','#972B09'] },
    },
    series: [
      {
        name: 'Pearson Correlation Matrix',
        type: 'heatmap',
        data: dataset,
        label: { show: true },

        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' },
        },
      },
    ],
  };

  return (
    <div className="h-full w-full min-w-[800px] flex items-center justify-center ">
      <ReactECharts option={option} className="h-full w-full" />
    </div>
  );
};
