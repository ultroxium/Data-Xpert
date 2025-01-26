import React from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';

interface LineChartProps {
  xAxisData: string[];
  yAxisData?: number[];
  xLabel?: string;
  yLabel?: string;
  plotoption?: string;
  color?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  xAxisData,
  yAxisData,
  xLabel,
  yLabel,
  plotoption,
  color,
}) => {
  const option: EChartsOption = {
    grid: {
      // left: '20%',
      // right: '20%',
      // bottom: '20%',
      // top: '20%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      name: xLabel,
      nameLocation: 'middle',
      nameTextStyle: {
        fontWeight: 'bold',
        fontSize: 12,
        padding: 10,
      },
    },
    yAxis: {
      type: 'value',
      name: yLabel ? yLabel + `(${plotoption})` : xLabel + `(${plotoption})`,
      nameLocation: 'end',
      nameTextStyle: {
        fontWeight: 'bold',
        fontSize: 12,
        padding: 10,
      },
    },
    series: [
      {
        name: '',
        type: 'line',
        data: yAxisData,
        itemStyle: {
          color:  color?color:'#3b82f690',
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

export default LineChart;
